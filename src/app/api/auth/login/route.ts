import { NextResponse } from "next/server";
import { logAudit } from '@/lib/logAudit';
import { getLogoBase64 } from "@/lib/getLogoBase64";
import { codigo2FAEmail } from "@/lib/emailsHtml/codigo2FAEmail";

function generate2FACode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

// Rate limit en memoria (IP -> intentos)
type RateLimitEntry = {
  count: number;
  firstAttempt: number;
};

const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutos
const MAX_ATTEMPTS = 5;

const rateLimitMap = new Map<string, RateLimitEntry>();

const MAX_BODY_SIZE = 10 * 1024; // 10 KB

function normalizeRut(rut: string) {
  return rut.replace(/\./g, "").replace("-", "").toUpperCase();
}

function isValidRutFormat(rut: string) {
  // formato básico: 7 u 8 dígitos + dígito verificador
  return /^[0-9]{7,8}[0-9K]$/.test(rut);
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  // Ventana expirada → reset
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true };
  }

  entry.count += 1;

  if (entry.count > MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil(
        (RATE_LIMIT_WINDOW - (now - entry.firstAttempt)) / 1000
      ),
    };
  }

  return { allowed: true };
}


export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get("content-length");

    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { message: "Payload demasiado grande" },
        { status: 413 }
      );
    }

    const { rut, password, turnstileToken } = await req.json();
    const rutTrimmed = rut.trim();

    if (!rut || !password) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 400 }
      );
    }

    const normalizedRut = normalizeRut(rutTrimmed);

    if (!isValidRutFormat(normalizedRut)) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const rateLimit = checkRateLimit(`${ip}:${normalizedRut}`);

    if (!rateLimit.allowed) {
      await logAudit({
        event_type: "AUTH_LOGIN_BLOCKED",
        level: "SECURITY",
        message: "Rate limit excedido en login",
        ip,
        rut: normalizedRut,
        metadata: {
          retry_after_seconds: rateLimit.retryAfter,
        },
      });

      return NextResponse.json(
        {
          message: "Demasiados intentos. Intenta nuevamente más tarde.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
          },
        }
      );
    }

    if (!turnstileToken) {
      return NextResponse.json({ message: "Validación antibot requerida" }, { status: 400 });
    }

    // 1) Turnstile verify
    const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET || "",
        response: turnstileToken,
      }),
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      await logAudit({
        event_type: "AUTH_TURNSTILE_FAILED",
        level: "SECURITY",
        message: "Falló verificación antibot",
        ip,
        rut: normalizedRut,
        user_agent: req.headers.get("user-agent") ?? undefined,
      });

      return NextResponse.json({ message: "Falló la verificación antibot" }, { status: 403 });
    }

    // 2) Strapi login
    const strapiRes = await fetch(`${STRAPI_URL}/api/auth/login-rut`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rut: rutTrimmed, password }),
    });
    const strapiData = await strapiRes.json();

    if (!strapiRes.ok) {
      await logAudit({
        event_type: "AUTH_LOGIN_FAILED",
        level: "WARNING",
        message: "Credenciales inválidas",
        ip,
        rut: normalizedRut,
      });
      return NextResponse.json(
        { message: strapiData?.error?.message || "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // borrando algunos campos sensibles
    delete strapiData.user.email;
    delete strapiData.cliente.users_permissions_user.email;
    delete strapiData.cliente.cupo_total;


    const jwt = strapiData.jwt;
    const user = strapiData.user;
    const cliente = strapiData.cliente;

    // 3) Verificar que el cliente tenga email
    if (!cliente?.email) {
      await logAudit({
        event_type: "AUTH_LOGIN_NO_EMAIL",
        level: "SECURITY",
        message: "Cliente sin email, no se puede enviar 2FA",
        ip,
        rut: normalizedRut,
        user_id: user.documentId,
      });

      return NextResponse.json(
        { message: "Tu cuenta no tiene un correo asociado. Contacta a soporte." },
        { status: 403 }
      );
    }

    // 4) Generar código 2FA
    const twoFACode = generate2FACode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 5 minutos

    // Guardar código 2FA + JWT temporal en Strapi (cliente)
    const saveCodeRes = await fetch(
      `${STRAPI_URL}/api/clientes/${cliente.documentId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            two_factor_code: twoFACode,
            two_factor_expires_at: expiresAt.toISOString(),
            temp_jwt: jwt,
            two_factor_attempts: 0, 
          },
        }),
      }
    );

    if (!saveCodeRes.ok) {
      throw new Error("Error guardando código 2FA en Strapi");
    }

    // Enviar email con el código

    const logoBase64 = await getLogoBase64();
    const html = codigo2FAEmail({ nombre: cliente.nombre, codigo: twoFACode, logoBase64, });

    const emailRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send`, {
      method: "POST",
      body: JSON.stringify({
        to: cliente.email,
        subject: "Código de Verificación",
        html,
      }),
    });

    if (!emailRes.ok) {
      throw new Error("Error enviando email 2FA");
    }

    await logAudit({
      event_type: "AUTH_2FA_CODE_SENT",
      level: "INFO",
      message: "Código 2FA generado",
      ip,
      rut: normalizedRut,
      user_id: user.documentId,
    });

    // 5) Responder que requiere 2FA (sin cookie aún)
    return NextResponse.json(
      {
        needs2FA: true,
        tempUserId: user.documentId,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
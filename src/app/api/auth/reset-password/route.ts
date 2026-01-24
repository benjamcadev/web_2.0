
import { NextResponse } from "next/server";
import { getLogoBase64 } from "@/lib/getLogoBase64";
import { changePasswordEmail } from "@/lib/emailsHtml/changePasswordEmail";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MAX = 5; // intentos
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function validatePassword(password: string) {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Debe tener al menos 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Debe incluir al menos una letra mayúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Debe incluir al menos una letra minúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Debe incluir al menos un número");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Debe incluir al menos un carácter especial");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  rateLimitStore.set(key, entry);
  return { allowed: true };
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const rate = checkRateLimit(`reset-password:${ip}`);

    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: "Demasiados intentos. Intenta nuevamente más tarde.",
          retryAfter: rate.retryAfter,
        },
        { status: 429 }
      );
    }

    if (!token || !password) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);

    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: "La contraseña no cumple los requisitos de seguridad",
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Buscar cliente por token
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/clientes?filters[reset_password_token][$eq]=${token}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
      }
    );

    const data = await res.json();
    const cliente = data?.data?.[0];

    if (!cliente) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 }
      );
    }

    const userId = cliente.users_permissions_user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario asociado no encontrado" },
        { status: 400 }
      );
    }

    const expires = new Date(cliente.reset_password_expires);

    if (expires < new Date()) {
      return NextResponse.json(
        { error: "El enlace ha expirado" },
        { status: 400 }
      );
    }

    //const hashedPassword = await bcrypt.hash(password, 12);

    // Actualizar password en users-permissions-user
    const resUser = await fetch(
      `${process.env.STRAPI_URL}/api/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
          password: password,
        }),
      }
    );

    if (!resUser) {
      return NextResponse.json(
        { error: "Error al actualizar contraseña" },
        { status: 400 }
      );
    }


    // Limpiar token en Cliente
    await fetch(
      `${process.env.STRAPI_URL}/api/clientes/${cliente.documentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            reset_password_token: null,
            reset_password_expires: null,
          },
        }),
      }
    );

    const logoBase64 = await getLogoBase64();
    const html = changePasswordEmail({ nombre: cliente.nombre, logoBase64 });

     await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send`, {
      method: "POST",
      body: JSON.stringify({
        to: cliente.email,
        subject: "Cambio de contraseña",
        html,
      }),
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
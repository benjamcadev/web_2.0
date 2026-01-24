import { NextResponse } from "next/server";
import crypto from "crypto";
import { resetPasswordEmail } from "@/lib/emailsHtml/resetPasswordEmail";
import { getLogoBase64 } from "@/lib/getLogoBase64";
import { logAudit } from '@/lib/logAudit'

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const { email, turnstileToken, rut } = await req.json();

    // Validación básica
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: true });
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
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown";
        
      await logAudit({
        event_type: "AUTH_TURNSTILE_FAILED",
        level: "SECURITY",
        message: "Falló verificación antibot al recuperar contraseña",
        ip,
        rut,
        user_agent: req.headers.get("user-agent") ?? undefined,
      });

      return NextResponse.json({ message: "Falló la verificación antibot" }, { status: 403 });
    }

    // Buscar cliente en Strapi
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/clientes?filters[email][$eq]=${email}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
      }
    );

    const data = await res.json();
    const cliente = data?.data?.[0];

    // Seguridad: si no existe, NO avisar
    if (!cliente) {
      return NextResponse.json({ ok: true });
    }

    // Generar token seguro
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    // Guardar token en Strapi
    await fetch(`${process.env.STRAPI_URL}/api/clientes/${cliente.documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          reset_password_token: token,
          reset_password_expires: expires,
        },
      }),
    });

    // Enviar correo
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
    const logoBase64 = await getLogoBase64();

    const html = resetPasswordEmail({ nombre: cliente.nombre, resetUrl, logoBase64 });

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send`, {
      method: "POST",
      body: JSON.stringify({
        to: email,
        subject: "Recupera tu contraseña",
        html,
      }),
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ ok: true });
  }
}
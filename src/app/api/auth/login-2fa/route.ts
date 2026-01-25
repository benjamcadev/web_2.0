import { NextResponse } from "next/server";
import { logAudit } from '@/lib/logAudit';

const STRAPI_URL = process.env.STRAPI_URL!;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN!;

export async function POST(req: Request) {
  try {
    const { tempUserId, code } = await req.json();

    if (!tempUserId || !code) {
      return NextResponse.json(
        { message: "Código inválido" },
        { status: 400 }
      );
    }

    // 1) Obtener cliente desde Strapi filtrando por el usuario (documentId)
    const clientesRes = await fetch(
      `${STRAPI_URL}/api/clientes?filters[users_permissions_user][documentId][$eq]=${encodeURIComponent(
        tempUserId
      )}&populate=users_permissions_user`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
      }
    );

    if (!clientesRes.ok) {
      // Si Strapi responde 401/403/404, devolvemos algo más útil
      const text = await clientesRes.text().catch(() => "");
      console.error("Error validando usuario/cliente en Strapi:", clientesRes.status, text);

      return NextResponse.json(
        { message: "Error validando usuario" },
        { status: 500 }
      );
    }

    const clientesJson = await clientesRes.json();

    // Strapi suele devolver { data: [...] }
    const cliente = Array.isArray(clientesJson)
      ? clientesJson?.[0]
      : clientesJson?.data?.[0];

    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente no encontrado" },
        { status: 404 }
      );
    }

    const user = cliente.users_permissions_user;

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // 2) Validar código y expiración
    if (!cliente.two_factor_code || !cliente.two_factor_expires_at) {
      return NextResponse.json(
        { message: "No hay código activo" },
        { status: 400 }
      );
    }
    const attempts = cliente.two_factor_attempts ?? 0;
    if (attempts >= 5) {
      return NextResponse.json(
        { message: "Código bloqueado por demasiados intentos, vuelve a iniciar sesión" },
        { status: 403 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(cliente.two_factor_expires_at);

    if (now > expiresAt) {
      // resetear intentos al expirar
      await fetch(`${STRAPI_URL}/api/clientes/${cliente.documentId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            two_factor_code: null,
            two_factor_expires_at: null,
            temp_jwt: null,
            two_factor_attempts: 0,
          },
        }),
      });

      await logAudit({
        event_type: "AUTH_2FA_EXPIRED",
        level: "SECURITY",
        message: "Código 2FA expirado",
        user_id: user.documentId,
        rut: cliente.rut,
      });

      return NextResponse.json(
        { message: "Código expirado" },
        { status: 400 }
      );
    }

    if (cliente.two_factor_code !== code) {
      // incrementar intentos
      await fetch(`${STRAPI_URL}/api/clientes/${cliente.documentId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            two_factor_attempts: attempts + 1,
          },
        }),
      });

      await logAudit({
        event_type: "AUTH_2FA_FAIL",
        level: "SECURITY",
        message: "Código 2FA incorrecto",
        user_id: user.documentId,
        rut: cliente.rut,
      });

      return NextResponse.json(
        { message: "Código inválido" },
        { status: 401 }
      );
    }

    // 3) Limpiar código 2FA y JWT temporal en Strapi
    await fetch(`${STRAPI_URL}/api/clientes/${cliente.documentId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          two_factor_code: null,
          two_factor_expires_at: null,
          temp_jwt: null,
          two_factor_attempts: 0,
        },
      }),
    });

    await logAudit({
      event_type: "AUTH_2FA_SUCCESS",
      level: "SECURITY",
      message: "Código 2FA validado correctamente",
      user_id: user.documentId,
      rut: cliente.rut,
    });

    // 4) Usar JWT temporal guardado en el cliente
    const jwt = cliente.temp_jwt;

    if (!jwt) {
      return NextResponse.json(
        { message: "Sesión temporal no encontrada" },
        { status: 401 }
      );
    }

    // 5) Set cookie
    const res = NextResponse.json(
      { user: user, cliente: cliente },
      { status: 200 }
    );

    res.cookies.set("ap_jwt", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    return res;
  } catch (err) {
    console.error("Error en login-2fa:", err);
    return NextResponse.json(
      { message: "Error interno" },
      { status: 500 }
    );
  }
}
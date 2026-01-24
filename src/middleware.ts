import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const encoder = new TextEncoder();
const JWT_SECRET = process.env.STRAPI_JWT_SECRET!;


// Rutas que quieres proteger
const PROTECTED_PATHS = ["/mi-cuenta", "/empresas"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get("ap_jwt")?.value;

  if (!token) {
    return redirectToHome(req);
  }

  try {
    // 🔐 Verificar firma y expiración
    await jwtVerify(token, encoder.encode(JWT_SECRET));

    // Token válido → continuar
    return NextResponse.next();
  } catch (error) {
    // Token inválido o expirado
    return redirectToHome(req);
  }
}

function redirectToHome(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

// Matcher (Next ejecuta middleware solo aquí)
export const config = {
  matcher: ["/mi-cuenta/:path*", "/empresas/:path*"],
};
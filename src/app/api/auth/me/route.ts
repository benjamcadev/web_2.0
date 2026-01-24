import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
const STRAPI_JWT_SECRET = process.env.STRAPI_JWT_SECRET;

const encoder = new TextEncoder();

export async function GET() {
    try {
        const token = (await cookies()).get("ap_jwt")?.value;

        if (!token) {
            return NextResponse.json({ message: "No autenticado" }, { status: 401 });
        }

        if (!STRAPI_JWT_SECRET) {
            return NextResponse.json(
                { message: "Falta STRAPI_JWT_SECRET en el servidor" },
                { status: 500 }
            );
        }

        // 1) Verificar firma y expiración del JWT
        const { payload } = await jwtVerify(
            token,
            encoder.encode(STRAPI_JWT_SECRET),
            { algorithms: ["HS256"] }
        );

        const userId = payload?.id;
        if (!userId) {
            return NextResponse.json({ message: "JWT inválido" }, { status: 401 });
        }

        // 2) Traer el USER desde Strapi (opcional pero útil)
        const userRes = await fetch(`${STRAPI_URL}/api/users/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

       

        if (!userRes.ok) {
            return NextResponse.json({ message: "Sesión inválida" }, { status: 401 });
        }

        const user = await userRes.json();

        // 3) Traer el CLIENTE relacionado al user
        // Ajusta permisos en Strapi para que Authenticated pueda "find" Cliente.
        const clienteRes = await fetch(
            `${STRAPI_URL}/api/clientes?filters[users_permissions_user][documentId][$eq]=${user.documentId}&populate=*`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );


        let cliente = null;
        if (clienteRes.ok) {
            const clienteJson = await clienteRes.json();
            cliente = clienteJson?.data?.[0] ?? null;
        }

        return NextResponse.json({ user, cliente }, { status: 200 });
    } catch (err) {
      
        return NextResponse.json({ message: "Sesión inválida" }, { status: 401 });
    }
}
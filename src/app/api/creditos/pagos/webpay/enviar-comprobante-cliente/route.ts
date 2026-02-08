import { NextResponse } from "next/server";
import { generarHTMLComprobantePagoCreditoCliente } from "@/lib/emailsHtml/comprobantePagoCreditoCliente";
import { getLogoBase64 } from "@/lib/getLogoBase64";

export async function POST(req: Request) {
    try {
        const { email, data } = await req.json();

        if (!email || !email.includes("@")) {
            return NextResponse.json(
                { ok: false, error: "Email inválido" },
                { status: 400 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { ok: false, error: "No se recibió la data del comprobante" },
                { status: 400 }
            );
        }

        const logoBase64 = await getLogoBase64();

        const html = generarHTMLComprobantePagoCreditoCliente({data, logoBase64});

        const emailRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send`, {
            method: "POST",
            body: JSON.stringify({
                to: email,
                subject: "Comprobante de Pago - Webpay",
                html,
            }),
        });



        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Error enviando comprobante:", error);
        return NextResponse.json(
            { ok: false, error: "Error interno al enviar comprobante" },
            { status: 500 }
        );
    }
}

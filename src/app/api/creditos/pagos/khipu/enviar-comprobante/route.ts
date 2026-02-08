import { NextResponse } from "next/server";
import { getLogoBase64 } from "@/lib/getLogoBase64";
import { generarHTMLComprobantePagoCreditoCliente } from "@/lib/emailsHtml/comprobantePagoCreditoCliente";
import { sendEmail } from '@/lib/sendEmail'

export async function POST(req: Request) {
    try {
        const { email, detalle, credito, pago } = await req.json();

        if (!email || !detalle  || !credito) {
            return NextResponse.json(
                { ok: false, message: "Faltan datos para enviar comprobante" },
                { status: 400 }
            );
        }


         const data = {
            ok: true,
            status: "AUTHORIZED",
            khipu: {transaction_id: detalle.transaction_id, amount: detalle.amount, payment_method: detalle.payment_method, bank_account_number: detalle.bank_account_number, conciliation_date: detalle.conciliation_date, bank: detalle.bank },
            pago: pago,
            credito: credito
        }

        const logoBase64 = await getLogoBase64();
        const html = generarHTMLComprobantePagoCreditoCliente({ data, logoBase64 });

        const sendEmailResponse = await sendEmail({ email, subject: "Comprobante de Pago - Khipu", html })

        if (!sendEmailResponse.success) {
            console.error("Error, no se pudo enviar correo de comprobante pago credito cliente:", sendEmailResponse.error);
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("Error enviando comprobante Khipu:", error);
        return NextResponse.json(
            { ok: false, message: "Error enviando comprobante" },
            { status: 500 }
        );
    }
}
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generarHTMLComprobanteWebpay } from "@/lib/emailsHtml/webpayComprobante";

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

    // ===========================================================
    //  📨 CONFIGURACIÓN SMTP (CAMBIA ESTO POR TUS CREDENCIALES)
    // ===========================================================
   
     const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

    const html = generarHTMLComprobanteWebpay({ email, data });

    await transporter.sendMail({
      from: `"Tienda" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Comprobante de Pago - Webpay",
      html,
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

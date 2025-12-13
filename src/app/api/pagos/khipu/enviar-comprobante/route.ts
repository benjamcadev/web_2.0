import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generarHtmlKhipuComprobante } from "@/lib/emailsHtml/khipuComprobante";

export async function POST(req: Request) {
  try {
    const { email, detalle, pedido } = await req.json();

    if (!email || !detalle || !pedido) {
      return NextResponse.json(
        { ok: false, message: "Faltan datos para enviar comprobante" },
        { status: 400 }
      );
    }

    // Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = generarHtmlKhipuComprobante({
      pago: detalle,
      pedido,
    });

    await transporter.sendMail({
     from: `"Tienda" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Comprobante de pago - Pedido #${pedido.numero_pedido}`,
      html,
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("Error enviando comprobante Khipu:", error);
    return NextResponse.json(
      { ok: false, message: "Error enviando comprobante" },
      { status: 500 }
    );
  }
}
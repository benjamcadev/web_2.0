import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { generarHtml } from "@/lib/generarHtml";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productosArray = body.data;

    // Generar HTML del catálogo
    const html = generarHtml(productosArray);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();

    // Convertimos el Buffer de Node.js a Uint8Array (compatible con Response)
    const pdfArray = new Uint8Array(pdfBuffer);

    return new Response(pdfArray, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="catalogo.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json(
      { error: "Error interno al generar el PDF" },
      { status: 500 }
    );
  }
}

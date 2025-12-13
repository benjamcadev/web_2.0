import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { np: pagoId } = body;

    

    if (!pagoId) {
      return NextResponse.json(
        { ok: false, message: "Falta pagoId" },
        { status: 400 }
      );
    }

    // Buscar pago en Strapi
    const pagoRes = await fetch(
      `${process.env.STRAPI_URL}/api/pagos?filters[numero_pago][$eq]=${pagoId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
      }
    );

    const pagoData = await pagoRes.json();
    const pago = pagoData.data?.[0];

    if (!pago) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    

    // Marcar como cancelado
    await fetch(
      `${process.env.STRAPI_URL}/api/pagos/${pago.documentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            estado: "cancelado",
            metadata: {
              cancelled_at: new Date().toISOString(),
              reason: "Usuario canceló el pago en Khipu",
              fecha: "UTC"
            },
          },
        }),
      }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error cancelando pago Khipu:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno" },
      { status: 500 }
    );
  }
}
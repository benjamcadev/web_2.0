import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pagoId = searchParams.get("pagoId");

    if (!pagoId) {
      return NextResponse.json(
        { ok: false, message: "Falta pagoId" },
        { status: 400 }
      );
    }

    // Buscar el pago en Strapi
    const pagoRes = await fetch(
      `${process.env.STRAPI_URL}/api/pagos?filters[numero_pago][$eq]=${pagoId}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
      }
    );

    const pagoData = await pagoRes.json();
    const pago = pagoData.data?.[0];

    if (!pago) {
      return NextResponse.json(
        { ok: false, message: "Pago no encontrado" },
        { status: 404 }
      );
    }

    const payment_id = pago.payment_id;
    if (!payment_id) {
      return NextResponse.json(
        { ok: false, message: "El pago no tiene payment_id asociado" },
        { status: 400 }
      );
    }

    //  Si el webhook YA confirmó el pago
    if (pago.estado === "pagado") {
      return NextResponse.json({
        ok: true,
        pagado: true,
        payment_id,
        detalle: pago.metadata ?? null,
        pedido: pago.pedido
      });
    }

    // Si el pago NO está pagado aún (pendiente)
    return NextResponse.json({
      ok: true,
      pagado: false,
      payment_id,
    });

  } catch (error) {
    console.error("Error validando pago:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno validando estado de pago" },
      { status: 500 }
    );
  }
}
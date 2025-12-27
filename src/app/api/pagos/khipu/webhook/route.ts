import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session");

    const payment_id = body.payment_id;

    if (!payment_id) {
      console.warn("Webhook sin payment_id, ignorado.");
      return NextResponse.json(
        { ok: true, ignored: true, message: "Webhook sin payment_id" },
        { status: 200 }
      );
    }

    // Buscar pago en Strapi
    const pagoRes = await fetch(
      `${process.env.STRAPI_URL}/api/pagos?filters[payment_id][$eq]=${payment_id}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    const pagoData = await pagoRes.json();
    const pago = pagoData.data?.[0];

    if (!pago) {
      console.warn("Webhook: pago no encontrado en Strapi:", payment_id);
      return NextResponse.json(
        { ok: true, ignored: true, message: "Pago no encontrado" },
        { status: 200 }
      );
    }

    // Actualizar pago a pagado
    const fechaChileString = new Date().toLocaleString("es-CL", {
      timeZone: "America/Santiago",
      hour12: false,
    });

    const updateRes = await fetch(
      `${process.env.STRAPI_URL}/api/pagos/${pago.documentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            estado: "pagado",
            fecha_confirmacion_utc: new Date().toISOString(),
            fecha_confirmacion_cl: fechaChileString,
            metadata: body, // Guarda el JSON completo del webhook
          },
        }),
      }
    );

    const updateData = await updateRes.json();

    // Confirmar descuento de Giftcard (si aplica)
    const giftcardCode = pago?.giftcard_code;
    const giftcardAmount = pago?.giftcard_amount_applied;

    if (giftcardCode && giftcardAmount && giftcardAmount > 0) {
      // Buscar el pago de tipo giftcard asociado al mismo pedido
      const pedidoDocumentId = pago?.pedido?.documentId;

      if (pedidoDocumentId) {
        const pagoGiftcardRes = await fetch(
          `${process.env.STRAPI_URL}/api/pagos?filters[pedido][documentId][$eq]=${pedidoDocumentId}&filters[proveedor][$eq]=giftcard`,
          {
            headers: {
              Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
            },
            cache: "no-store",
          }
        );

        const pagoGiftcardData = await pagoGiftcardRes.json();
        const pagoGiftcard = pagoGiftcardData.data?.[0];

        if (pagoGiftcard) {
          const giftcardRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/pagos/giftcard/confirmar`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: giftcardCode,
                amount: giftcardAmount,
                pagoId: pagoGiftcard.documentId, // pago giftcard correcto
                 source: "khipu"
              }),
            }
          );

          const giftcardData = await giftcardRes.json();

          if (!giftcardRes.ok || !giftcardData.success) {
            console.error("Giftcard NO descontada (Khipu):", giftcardData);
          }
        } else {
          console.warn("No se encontró pago giftcard para el pedido:", pedidoDocumentId);
        }
      }
    }

    // Rebajamos stock
    const completeRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/reservas-stock/completada`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }
    );

    const completeData = await completeRes.json();
    console.log("Resultado completar reserva:", completeData);

    if (!completeData.ok) {
      console.error("Pago OK, pero error al actualizar reservas. " + sessionId);
    }

    // Responder SIEMPRE 200 OK
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Error en webhook Khipu:", error);

    // Incluso si falla, respondemos 200 para evitar reintentos
    return NextResponse.json(
      { ok: true, error: "Error procesando webhook" },
      { status: 200 }
    );
  }
}
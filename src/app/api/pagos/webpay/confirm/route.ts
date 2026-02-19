import { NextResponse } from "next/server";
import { WebpayPlus, Options, Environment } from "transbank-sdk";

export async function POST(req: Request) {
  try {
    const { token_ws } = await req.json();

    const commerceCode = process.env.WEBPAY_COMMERCE_CODE!;
    const apiKey = process.env.WEBPAY_API_KEY_SECRET!;

    const options = new Options(
      commerceCode,
      apiKey,
      Environment.Integration
    );

    // 1) Confirmar transacción con Webpay
    const result = await new WebpayPlus.Transaction(options).commit(token_ws);


    if (result.status !== "AUTHORIZED") {
      return NextResponse.json({
        ok: false,
        error: "Pago no autorizado",
        webpay: result,
      });
    }

    const sessionId = result.session_id; //  Lo devuelve Webpay


    // Llamar a tu endpoint para completar la reserva
    const completeRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/reservas-stock/completada`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }
    );

    const completeData = await completeRes.json();

    if (!completeData.ok) {
      return NextResponse.json({
        ok: false,
        error: "Pago OK, pero error al actualizar reservas",
        detalles: completeData,
      });
    }

    const buyOrder = result.buy_order; //  Lo devuelve Webpay

    // Buscar pago en Strapi
    const pagoRes = await fetch(
      `${process.env.STRAPI_URL}/api/pagos?filters[buy_order][$eq]=${buyOrder}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
      }
    );

   
    const pagoData = await pagoRes.json();
    const pago = pagoData.data?.[0];

     const fechaChileString = new Date().toLocaleString("es-CL", {
            timeZone: "America/Santiago",
            hour12: false
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
            metadata: result, // Guarda el JSON completo de la respuesta de webpay
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
                 source: "webpay"
              }),
            }
          );

          const giftcardData = await giftcardRes.json();

          if (!giftcardRes.ok || !giftcardData.success) {
            console.error("Giftcard NO descontada (Webpay):", giftcardData);
          }
        } else {
          console.warn("No se encontró pago giftcard para el pedido:", pedidoDocumentId);
        }
      }
    }


    // Respuesta final
    return NextResponse.json({
      ok: true,
      status: "AUTHORIZED",
      webpay: result,
      reserva: completeData,
      pedido: pago.pedido
    });

  } catch (error: any) {
    console.error("Error confirm Webpay:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

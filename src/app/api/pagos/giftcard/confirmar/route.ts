import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL!;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN!;

export async function POST(req: Request) {
  try {
    const { code, amount, pagoId, source } = await req.json();

    if (!code || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, reason: "DATOS_INVALIDOS" },
        { status: 400 }
      );
    }

    // 1️Descontar saldo real de la Giftcard (Strapi - transacción interna)
    const redeemRes = await fetch(`${STRAPI_URL}/api/giftcards/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        code,
        amount,
        pagoId,
      }),
    });

    const redeemData = await redeemRes.json();

    if (!redeemRes.ok || !redeemData.success) {
      return NextResponse.json(
        { success: false, reason: redeemData?.error || "REDEEM_FALLIDO" },
        { status: 400 }
      );
    }

    // Obtener documentId de la Giftcard para relacionarla con el Pago
    const giftcardRes = await fetch(
      `${STRAPI_URL}/api/giftcards?filters[code][$eq]=${encodeURIComponent(code)}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    const giftcardJson = await giftcardRes.json();
    const giftcardDocumentId = giftcardJson?.data?.[0]?.documentId || null;

    const redeemedAt = new Date().toISOString();
    const redeemSource =
      typeof source === "string" && source.trim().length > 0
        ? source.trim()
        : "unknown";

    // Marcar el pago de tipo giftcard como PAGADO + guardar metadata
    if (pagoId) {
      // Traer metadata existente (si hay) para no pisar info previa
      const pagoRes = await fetch(`${STRAPI_URL}/api/pagos/${pagoId}`, {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        cache: "no-store",
      });

      const pagoJson = await pagoRes.json();
      const existingMetadata = pagoJson?.data?.metadata ?? {};

      const newMetadata = {
        ...existingMetadata,
        giftcard: {
          code,
          amount_applied: amount,
          remaining: redeemData?.remaining ?? null,
          redeemed_at: redeemedAt,
          redeem_source: redeemSource,
          redeem_status: "success",
        },
        giftcard_redeem_response: redeemData, // útil para debug/auditoría ligera
      };

      await fetch(`${STRAPI_URL}/api/pagos/${pagoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            estado: "pagado",
            metadata: newMetadata,
            ...(giftcardDocumentId
              ? {
                  giftcard: {
                    connect: [{ documentId: giftcardDocumentId }],
                  },
                }
              : {}),
          },
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error confirmando giftcard:", error);
    return NextResponse.json(
      { success: false, reason: "ERROR_INTERNO" },
      { status: 500 }
    );
  }
}
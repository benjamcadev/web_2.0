

import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL!;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN!;

export async function POST(req: Request) {
  try {
    const { code, amount, pagoId } = await req.json();

    if (!code || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, reason: "DATOS_INVALIDOS" },
        { status: 400 }
      );
    }

    // 1️⃣ Descontar saldo real de la Giftcard (Strapi - transacción interna)
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

    // 2️⃣ Marcar el pago de tipo giftcard como PAGADO
    if (pagoId) {
      await fetch(`${STRAPI_URL}/api/pagos/${pagoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            estado: "pagado",
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
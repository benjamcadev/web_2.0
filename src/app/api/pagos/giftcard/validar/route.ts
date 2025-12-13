import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL!;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN!;

export async function POST(req: Request) {
  try {
    const { code, orderTotal } = await req.json();

  
    if (!code || typeof orderTotal !== "number") {
      return NextResponse.json(
        { valid: false, reason: "DATOS_INVALIDOS" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${STRAPI_URL}/api/giftcards?filters[code][$eq]=${code}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    const json = await res.json();
    const giftcard = json?.data?.[0];

    if (!giftcard) {
      return NextResponse.json({ valid: false, reason: "NO_EXISTE" });
    }

    const { balance, active, expires_at } = giftcard;

    if (!active) {
      return NextResponse.json({ valid: false, reason: "INACTIVA" });
    }

    if (expires_at && new Date(expires_at) < new Date()) {
      return NextResponse.json({ valid: false, reason: "EXPIRADA" });
    }

    if (balance < orderTotal) {
      return NextResponse.json({ valid: false, reason: "SALDO_INSUFICIENTE" });
    }

    return NextResponse.json({
      valid: true,
      balance,
      coversTotal: balance >= orderTotal,
      remaining: balance - orderTotal,
      expires_at,
    });
  } catch (error) {
    console.error("Giftcard validate error:", error);
    return NextResponse.json(
      { valid: false, reason: "ERROR_INTERNO" },
      { status: 500 }
    );
  }
}
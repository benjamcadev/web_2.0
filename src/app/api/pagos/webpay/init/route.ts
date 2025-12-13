import { NextResponse } from "next/server";
import { WebpayPlus, Options, Environment } from "transbank-sdk";

export async function POST(req: Request) {
  try {
    const { amount, buyOrder, sessionId, pagoId } = await req.json();

    const commerceCode = process.env.WEBPAY_COMMERCE_CODE!;
    const apiKey = process.env.WEBPAY_API_KEY_SECRET!;
    const returnUrl = process.env.WEBPAY_RETURN_URL!;

    const options = new Options(
      commerceCode,
      apiKey,
      Environment.Integration // ← sandbox
    );

    // Crear transacción con las opciones nuevas
    const tx = await new WebpayPlus.Transaction(options).create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );

      //---------------- REGISTRAMOS EL buy_order EN EL PAGO CREADO EN STRAPI --------------//
       // Guardar el nuevo valor
        await fetch(`${process.env.STRAPI_URL}/api/pagos/${pagoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
            },
            body: JSON.stringify({
                data: { buy_order: buyOrder },
            }),
        });



    return NextResponse.json({
      ok: true,
      token: tx.token,
      url: tx.url, // Donde debemos redirigir al usuario
    });
  } catch (error: any) {
    console.error("Error init Webpay:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

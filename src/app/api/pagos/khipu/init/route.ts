import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, cliente, transactionId, pagoId, numeroPago, sessionId } = await req.json();

    const apiKey = process.env.KHIPU_API_KEY!;

    const paymentResponse = await fetch("https://payment-api.khipu.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({
        amount,
        currency: "CLP",
        subject: "Pago en Agroplastic",
        transaction_id: transactionId,
        notify_api_version: "3.0",
        return_url: `${process.env.URL_TUNNEL}/pago/khipu/success?np=${numeroPago}`, // id del pago en strapi
        cancel_url: `${process.env.URL_TUNNEL}/pago/khipu/cancel?np=${numeroPago}`,
        notify_url: `${process.env.URL_TUNNEL}/api/pagos/khipu/webhook?session=${sessionId}`,
        payer_name: cliente.nombre,
        payer_email: cliente.email,
        //mandatory_payment_method: "simplified_transfer"
      })
    });

    const data = await paymentResponse.json();

    //---------------- REGISTRAMOS EL payment_id EN EL PAGO CREADO EN STRAPI --------------//
       // Guardar el nuevo valor
        await fetch(`${process.env.STRAPI_URL}/api/pagos/${pagoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
            },
            body: JSON.stringify({
                data: { payment_id: data.payment_id },
            }),
        });

   

    return NextResponse.json({ ok: true, payment: data , return_url: `${process.env.URL_TUNNEL}/pago/khipu/success`});

  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false });
  }
}

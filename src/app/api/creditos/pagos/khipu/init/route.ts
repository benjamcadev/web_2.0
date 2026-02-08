import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const STRAPI_URL = process.env.STRAPI_URL;
    const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
    const NEXT_URL = process.env.NEXT_URL;
    try {
        const { amount, cliente, transactionId, creditoDocumentId, sessionId, metodoPago } = await req.json();

        //Validar credito
        const body = {
            creditoDocumentId,
            rutCliente: cliente.rut,
            monto: amount

        }
        const resValidar = await fetch(`${NEXT_URL}/api/creditos/validar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const dataValidar = await resValidar.json();

        if (!dataValidar.success) {
            return NextResponse.json(
                { ok: false, error: dataValidar.message },
                { status: dataValidar.status }
            );
        }

        //------------------------OBTENER ULTIMO NUMERO DE PAGO --------------------//
        // Obtener y actualizar counter
        const counterResPago = await fetch(`${process.env.STRAPI_URL}/api/contadores?filters[nombre][$eq]=pago`, {
            headers: {
                Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
            },
        });
        const counterDataPago = await counterResPago.json();
        let currentPago = Number(counterDataPago.data[0].valor);
        let idContador = counterDataPago.data[0].documentId;

        // Incrementar
        const newValuePago = currentPago + 1;

        //--------------------------------------------------------------------------//

        const fechaChileString = new Date().toLocaleString("es-CL", {
            timeZone: "America/Santiago",
            hour12: false
        });



      // INICIALIZAMOS PAGO DE KHIPU

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
                return_url: `${process.env.URL_TUNNEL}/credito/khipu/success?np=${newValuePago}`, // id del pago en strapi
                cancel_url: `${process.env.URL_TUNNEL}/credito/khipu/cancel?np=${newValuePago}`,
                notify_url: `${process.env.URL_TUNNEL}/api/creditos/pagos/khipu/webhook?session=${sessionId}`,
                payer_name: cliente.nombre,
                payer_email: cliente.email,
                //mandatory_payment_method: "simplified_transfer"
            })
        });

        const data = await paymentResponse.json();


  // Crear PAGO en Strapi (Aquí guardamos la relación)
        const nuevoPagoRes = await fetch(`${STRAPI_URL}/api/pagos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${STRAPI_TOKEN}`,
            },
            body: JSON.stringify({
                data: {
                    numero_pago: newValuePago,
                    proveedor: metodoPago,
                    estado: "pendiente",
                    monto: amount,
                   payment_id: data.payment_id,
                    fecha_intento_cl: fechaChileString,
                    fecha_intento_utc: new Date().toISOString(),
                    datos_pago_cliente: cliente,
                    cliente: cliente.documentId,
                    credito: creditoDocumentId
                }
            })
        });

        const nuevoPagoData = await nuevoPagoRes.json();



  // =============================================================================
        // 8. ACTUALIZAR CONTADOR (ACTUALIZAR VALOR EN STRAPI)
        // =============================================================================

        await fetch(`${STRAPI_URL}/api/contadores/${idContador}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${STRAPI_TOKEN}`,
            },
            body: JSON.stringify({
                data: { valor: newValuePago },
            }),
        });
        // =============================================================================






        return NextResponse.json({ ok: true, payment: data, return_url: `${process.env.URL_TUNNEL}/pago/khipu/success` });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ ok: false });
    }
}

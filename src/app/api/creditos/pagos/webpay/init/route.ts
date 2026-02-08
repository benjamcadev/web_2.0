import { NextResponse } from "next/server";
import { WebpayPlus, Options, Environment } from "transbank-sdk";

export async function POST(req: Request) {
    const STRAPI_URL = process.env.STRAPI_URL;
    const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
    const NEXT_URL = process.env.NEXT_URL;

    try {
        const { amount, buyOrder, sessionId, creditoDocumentId, cliente, metodoPago } = await req.json();

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

        // Inicializar pago webpay
        const commerceCode = process.env.WEBPAY_COMMERCE_CODE!;
        const apiKey = process.env.WEBPAY_API_KEY_SECRET!;
        const returnUrl = process.env.WEBPAY_RETURN_URL_CREDIT!;

        const options = new Options(
            commerceCode,
            apiKey,
            Environment.Integration
        );

        // Crear transacción con las opciones nuevas
        const tx = await new WebpayPlus.Transaction(options).create(
            buyOrder,
            sessionId,
            amount,
            returnUrl
        );

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
                    buy_order: buyOrder,
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
import { NextResponse } from "next/server";
import { WebpayPlus, Options, Environment } from "transbank-sdk";
import { getLogoBase64 } from "@/lib/getLogoBase64";
import { generarHTMLComprobantePagoCreditoCliente } from "@/lib/emailsHtml/comprobantePagoCreditoCliente";
import { sendEmail } from '@/lib/sendEmail'

export async function POST(req: Request) {
    try {
        const { token_ws } = await req.json();

        const commerceCode = process.env.WEBPAY_COMMERCE_CODE!;
        const apiKey = process.env.WEBPAY_API_KEY_SECRET!;
        const STRAPI_URL = process.env.STRAPI_URL;
        const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
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

        // actualizar informacion del credito
        // calcular si pago el total o solo es abono
        const amount = result.amount;
        const saldo = pago.credito.saldo_pendiente - amount;
        let estadoCredito = ''

        if (saldo == 0) { estadoCredito = 'pagado' } else { estadoCredito = 'pendiente' }



        const updateCreditoRes = await fetch(
            `${process.env.STRAPI_URL}/api/creditos/${pago.credito.documentId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
                },
                body: JSON.stringify({
                    data: {
                        estado: estadoCredito,
                        saldo_pendiente: saldo
                    },
                }),
            }
        );

        const updateCreditoData = await updateCreditoRes.json();

        const fechaChileString = new Date().toLocaleString("es-CL", {
            timeZone: "America/Santiago",
            hour12: false
        });


        // 1. Intentar la actualización
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
                        metadata: result,
                    },
                }),
            }
        );

        // 2. Validación Nivel HTTP (Errores 400, 401, 403, 404, 500)
        if (!updateRes.ok) {
            // Intentamos leer el error que manda Strapi
            const errorText = await updateRes.text();
            console.error(`🚨 CRÍTICO: Webpay cobró pero falló update en Strapi (HTTP ${updateRes.status}).`);
            console.error("Detalle Error:", errorText);

            // Aquí podrías guardar un log en un archivo, enviar un email al admin, 
            // o lanzar un error para que lo capture el catch global.
            throw new Error(`Fallo al actualizar pago en BD: ${updateRes.statusText}`);
        }

        // 3. Validación Nivel Datos (Strapi respondió 200, pero ¿guardó bien?)
        const updateData = await updateRes.json();

        if (!updateData.data || updateData.error) {
            console.error("🚨 CRÍTICO: Strapi respondió pero devolvió error de validación.");
            console.error("Error Strapi:", updateData.error);

            throw new Error(updateData.error?.message || "Error desconocido en respuesta Strapi");
        }


        // --------------- LIBERAMOS EL CUPO DEL CLIENTE --------------- //

        const releaseRes = await fetch(`${process.env.STRAPI_URL}/api/clientes/credito/release`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
            },
            body: JSON.stringify({
                clienteDocumentId: pago.cliente.documentId, // Asegúrate de tener este dato
                amount: amount, // El monto que pagó en khipu
                pagoId: pago.id,
                creditoId: pago.credito.id
            }),
        });

        if (!releaseRes.ok) {
            console.error("ALERTA: Pago OK pero falló liberar cupo en Strapi");
        }

        const releaseResData = await releaseRes.json();




        //enviar comprobante del pago por email

        const data = {
            ok: true,
            status: "AUTHORIZED",
            webpay: result,
            pago: updateData,
            credito: updateCreditoData
        }

        const email = pago.cliente.email

        const logoBase64 = await getLogoBase64();

        const html = generarHTMLComprobantePagoCreditoCliente({ data, logoBase64 });

        const sendEmailResponse = await sendEmail({ email, subject: "Comprobante de Pago - Webpay", html })

        if (!sendEmailResponse.success) {
            console.error("Error, no se pudo enviar correo de comprobante pago credito cliente:", sendEmailResponse.error);
        }


        // Respuesta final
        return NextResponse.json({
            ok: true,
            status: "AUTHORIZED",
            webpay: result,
            pago: updateData,
            credito: updateCreditoData
        });

    } catch (error: any) {
        console.error("Error confirm Webpay:", error);
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }
}

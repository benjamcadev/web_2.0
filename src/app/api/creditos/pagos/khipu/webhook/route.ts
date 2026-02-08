import { NextResponse } from "next/server";
import { getLogoBase64 } from "@/lib/getLogoBase64";
import { generarHTMLComprobantePagoCreditoCliente } from "@/lib/emailsHtml/comprobantePagoCreditoCliente";
import { sendEmail } from '@/lib/sendEmail'

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

    //--------------------- Buscar pago en Strapi.  ------------------ //
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

    //-----------------  Actualizar pago a pagado. ---------------- //

    // Verificamos que ya fue cambiado el estado del pago, por ejemplo con el endpoint de /validacion
    if (pago.estado == "pagado") {
      console.warn("Pago ya fue verificado antes que el Webhook.");
      return NextResponse.json(
        { ok: true, ignored: true, message: "Pago ya verificado" },
        { status: 200 }
      );
    }

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



    //---------- Rebajamos la deuda del credito. ----------- //
    // actualizar informacion del credito
    // calcular si pago el total o solo es abono
    const amount = pago.monto;
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

    if (!updateCreditoRes.ok) {
      console.error("Pago OK, pero error al actualizar pago credito. " + sessionId);
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


    // --------- ENVIAR COMPROBANTE DE PAGO POR EMAIL ------ ///

    const data = {
      ok: true,
      status: "AUTHORIZED",
      khipu: body,
      pago: updateData,
      credito: updateCreditoData
    }

    const email = pago.cliente.email

    const logoBase64 = await getLogoBase64();
    const html = generarHTMLComprobantePagoCreditoCliente({ data, logoBase64 });

    const sendEmailResponse = await sendEmail({ email, subject: "Comprobante de Pago - Khipu", html })

    if (!sendEmailResponse.success) {
      console.error("Error, no se pudo enviar correo de comprobante pago credito cliente:", sendEmailResponse.error);
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
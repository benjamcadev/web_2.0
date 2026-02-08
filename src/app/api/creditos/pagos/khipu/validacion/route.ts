import { NextResponse } from "next/server";
import { getLogoBase64 } from "@/lib/getLogoBase64";
import { generarHTMLComprobantePagoCreditoCliente } from "@/lib/emailsHtml/comprobantePagoCreditoCliente";
import { sendEmail } from '@/lib/sendEmail'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const payment_id = searchParams.get("payment_id");

    if (!payment_id) {
      return NextResponse.json(
        { ok: false, message: "payment_id requerido" },
        { status: 400 }
      );
    }

    // Llamar a los servidores de Khipu
    const khipuRes = await fetch(
      `https://payment-api.khipu.com/v3/payments/${payment_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.KHIPU_API_KEY!,
        },
      }
    );

    const khipuData = await khipuRes.json();

    if (!khipuRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "Error al consultar Khipu",
          detalle: khipuData,
        },
        { status: 500 }
      );
    }

    // Validación final según Khipu
    const pagado =
      khipuData.result === "done" ||
      khipuData.status === "done" ||
      khipuData.result === "OK";


    if (!pagado) {
      return NextResponse.json(
        {
          ok: false,
          message: "Error, Khipu no responde ok para la validacion de pago",
          detalle: khipuData,
          pagado
        },
        { status: 500 }
      );
    }



    // pagar credito
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
      return NextResponse.json(
        {
          ok: false,
          message: "Pago no encontrado",
          detalle: pagoData,
        },
        { status: 500 }
      );
    }

    //-----------------  Actualizar pago a pagado. ---------------- //

    // Verificamos que ya fue cambiado el estado del pago, por ejemplo con el endpoint de /webhook
    if (pago.estado == "pagado") {
      console.warn("Pago ya fue verificado por Webhook.");
      return NextResponse.json(
        { ok: true, pagado: true, ignored: true, message: "Pago ya verificado" },
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
            metadata: khipuData, // Guarda el JSON completo del webhook
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

    if (!updateCreditoData.ok) {
      console.error("Pago OK, pero error al actualizar pago credito. " + pago.credito.documentId);
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

    // --------- ENVIAR COMPROBANTE DE PAGO POR EMAIL ------ ///

    const data = {
      ok: true,
      status: "AUTHORIZED",
      khipu: khipuData,
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


    return NextResponse.json({
      ok: true,
      pagado,
      detalle: khipuData,
    });

  } catch (error) {
    console.error("Error validación Khipu:", error);
    return NextResponse.json(
      { ok: false, message: "Error interno en validación" },
      { status: 500 }
    );
  }
}
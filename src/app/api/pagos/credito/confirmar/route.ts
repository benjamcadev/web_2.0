import { NextRequest, NextResponse } from "next/server";
import { generarHtmlCreditoComprobante } from "@/lib/emailsHtml/creditoComprobante";
import { getLogoBase64 } from "@/lib/getLogoBase64";

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { pedidoId, pagoId, numeroPago, cliente, amount, numeroPedido, deliveryType, sucursal, direccion, comuna, cupoTotal } = body;

    if (!pedidoId || !pagoId || !cliente?.id || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Datos incompletos" },
        { status: 400 }
      );
    }

    // 1. Llamar a Strapi para descontar crédito (endpoint transaccional)
    const redeemRes = await fetch(
      `${STRAPI_URL}/api/clientes/credito/redeem`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
          clienteId: cliente.id,
          clienteDocumentId: cliente.documentId,
          amount,
          pedidoId,
          pagoId,
          numeroPago,
        }),
      }
    );

    const redeemData = await redeemRes.json();

    if (!redeemRes.ok || !redeemData.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            redeemData?.message ||
            redeemData?.error ||
            "No se pudo descontar el crédito del cliente",
        },
        { status: 400 }
      );
    }

    // 2. Confirmar pago en Strapi (marcar como crédito)
    const pagoRes = await fetch(`${STRAPI_URL}/api/pagos/${pagoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          estado: "pagado",
          proveedor: "credito",
        },
      }),
    });


    if (!pagoRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Crédito descontado, pero no se pudo confirmar el pago",
        },
        { status: 500 }
      );
    }

    //enviar correo
    const logoBase64 = await getLogoBase64();

    const pedido = {
      numero_pedido: numeroPedido,
      total: amount,
      tipo_delivery: deliveryType,
      sucursal,
      direccion_envio: direccion,
      comuna_envio: comuna
    }

    const pago = {
      id: numeroPago,
      createdAt: new Date().toLocaleDateString("es-CL")
    }

    const cupoRestante = redeemData.cupo_restante;

    const html = generarHtmlCreditoComprobante({pedido,pago,cliente,cupoTotal,cupoRestante, logoBase64});

    const emailRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send`, {
      method: "POST",
      body: JSON.stringify({
        to: cliente.email,
        subject: "Comprobante de Compra",
        html,
      }),
    });

    return NextResponse.json({
      success: true,
      cupoRestante: redeemData.cupo_restante,
      cupoUsado: redeemData.usado,
      pagoId: redeemData.pagoId,
      pedidoId: redeemData.pedidoId
    });
  } catch (error) {
    console.error("Error confirmando pago con crédito:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
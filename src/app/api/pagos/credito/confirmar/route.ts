import { NextRequest, NextResponse } from "next/server";
import { generarHtmlCreditoComprobante } from "@/lib/emailsHtml/creditoComprobante";
import { getLogoBase64 } from "@/lib/getLogoBase64";

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// --- FUNCIÓN AUXILIAR: Rollback ---
async function cancelarPedido(pedidoId: number | string, motivo: string) {
  try {
    if (!pedidoId) return;
    
    console.warn(`Iniciando cancelación de pedido ${pedidoId}. Motivo: ${motivo}`);

    const fechaChile = new Date().toLocaleString("sv-SE", { 
      timeZone: "America/Santiago",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    }).replace(" ", "T");

    await fetch(`${STRAPI_URL}/api/pedidos/${pedidoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          estado: "cancelado", 
          metadata: {
            error_credito: motivo,
            fecha_fallo: fechaChile,
            intento_pago: "credito_interno"
          }
        },
      }),
    });
    console.log(`Pedido ${pedidoId} marcado como cancelado exitosamente.`);
  } catch (error) {
    console.error("CRÍTICO: No se pudo cancelar el pedido tras fallo de crédito", error);
  }
}

export async function POST(req: NextRequest) {
  let _pedidoId = null;

  try {
    const body = await req.json();

    const {
      pedidoId,
      cliente,
      amount,
      numeroPedido,
      deliveryType,
      sucursal,
      direccion,
      comuna,
      cupoTotal,
      giftcardCode,
      giftcardApplied 
    } = body;

    _pedidoId = pedidoId;

    // 1. Validación básica
    if (!pedidoId || !cliente?.documentId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Datos incompletos para procesar el crédito" },
        { status: 400 }
      );
    }

    // 2. Determinar Plazo
    let diasPlazo = 0; 
    const condicionSeleccionada = cliente.factura?.condicionPago;

    if (condicionSeleccionada === "90") diasPlazo = 90;
    else if (condicionSeleccionada === "60") diasPlazo = 60;
    else if (condicionSeleccionada === "30") diasPlazo = 30;
    else if (condicionSeleccionada === "15") diasPlazo = 15;
    else if (condicionSeleccionada === "7") diasPlazo = 7;
    else if (condicionSeleccionada === "contado") diasPlazo = 0;

    // 3. SEGURIDAD: Validación de permisos
    if (diasPlazo > 0) {
      const validacionRes = await fetch(`${STRAPI_URL}/api/clientes/${cliente.documentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
      });

      if (!validacionRes.ok) {
        const msg = "Error interno al verificar permisos del cliente.";
        await cancelarPedido(pedidoId, msg); 
        return NextResponse.json({ success: false, message: msg }, { status: 500 });
      }

      const clienteData = await validacionRes.json();
      const clienteReal = clienteData.data || clienteData; 
      const campoPermiso = `credito_${diasPlazo}`;

      if (!clienteReal || clienteReal[campoPermiso] !== true) {
        const msg = `Autorización denegada: Su cuenta no tiene habilitado el crédito a ${diasPlazo} días.`;
        await cancelarPedido(pedidoId, msg);
        return NextResponse.json({ success: false, message: msg }, { status: 403 });
      }
    }

    // 4. Descontar cupo en Strapi (Crédito Interno)
    const redeemRes = await fetch(`${STRAPI_URL}/api/clientes/credito/redeem`, {
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
      }),
    });

    const redeemData = await redeemRes.json();

    if (!redeemRes.ok || !redeemData.success) {
      const msg = redeemData?.message || "Cupo insuficiente o error al procesar.";
      await cancelarPedido(pedidoId, msg);
      return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }


    // =============================================================================
    // 5. GESTIÓN DEL CONTADOR (NUEVO BLOQUE CENTRALIZADO)
    // =============================================================================
    // Obtenemos el contador actual para "credito"
    const counterRes = await fetch(`${STRAPI_URL}/api/contadores?filters[nombre][$eq]=credito`, {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      cache: "no-store"
    });
    
    const counterData = await counterRes.json();
    
    // Validamos que exista el contador
    if (!counterData.data || counterData.data.length === 0) {
       await cancelarPedido(pedidoId, "Error interno: No existe el contador 'credito' en Strapi.");
       throw new Error("Falta configuración de contadores en el backend.");
    }

    const contadorItem = counterData.data[0];
    const currentVal = Number(contadorItem.valor);
    const idContador = contadorItem.documentId; // O .id según tu versión
    
    // Calculamos el nuevo número correlativo
    const nuevoNumeroCredito = currentVal + 1;
    // =============================================================================


    // 6. PRE-FETCH: Buscar Pago Giftcard ANTES de crear el crédito
    let pagoGiftcardId = null;
    let pagoGiftcardObject = null;

    if (giftcardCode && giftcardApplied && giftcardApplied > 0) {
      try {
        const pagoGiftRes = await fetch(
          `${STRAPI_URL}/api/pagos?filters[pedido][documentId][$eq]=${pedidoId}&filters[proveedor][$eq]=giftcard`,
          {
            headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
            cache: "no-store",
          }
        );
        const pagoGiftData = await pagoGiftRes.json();
        pagoGiftcardObject = pagoGiftData.data?.[0];
        
        if (pagoGiftcardObject) {
            pagoGiftcardId = pagoGiftcardObject.documentId;
        }
      } catch (err) {
        console.error("Error buscando pago giftcard:", err);
      }
    }


    // 7. Crear el registro en 'creditos'
    const hoy = new Date();
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(hoy.getDate() + diasPlazo);

    const options: Intl.DateTimeFormatOptions = { 
        timeZone: "America/Santiago",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false 
    };

    const fechaEmisionStrapi = hoy.toLocaleString("sv-SE", options).replace(" ", "T");
    const fechaVencimientoStrapi = fechaVencimiento.toLocaleString("sv-SE", options).replace(" ", "T");

    const creditoRes = await fetch(`${STRAPI_URL}/api/creditos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          // Asignamos el número que calculamos desde Contadores
          numero_credito: nuevoNumeroCredito,
          
          monto: amount,
          saldo_pendiente: amount,
          estado: "pendiente",
          fecha_emision: fechaEmisionStrapi, 
          fecha_vencimiento: fechaVencimientoStrapi,
          dias_credito: diasPlazo,
          cliente: cliente.documentId,
          pedido: pedidoId,
          // Vinculación con Giftcard si existe
          pagos: pagoGiftcardId ? [pagoGiftcardId] : []
        },
      }),
    });

    if (!creditoRes.ok) {
      const rawText = await creditoRes.text();
      console.error("ERROR STRAPI CREAR CRÉDITO:", rawText);
      await cancelarPedido(pedidoId, "Error técnico al registrar el crédito en base de datos.");
      throw new Error("No se pudo registrar el crédito en el sistema.");
    }

    const creditoData = await creditoRes.json();


    // =============================================================================
    // 8. ACTUALIZAR CONTADOR (ACTUALIZAR VALOR EN STRAPI)
    // =============================================================================
    // Solo si el crédito se creó con éxito, actualizamos el contador
    await fetch(`${STRAPI_URL}/api/contadores/${idContador}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({
            data: { valor: nuevoNumeroCredito },
        }),
    });
    // =============================================================================


    // 9. CONFIRMAR GIFTCARD (Descontar saldo)
    if (pagoGiftcardObject) {
      try {
          const confirmRes = await fetch(`${NEXT_PUBLIC_BASE_URL}/api/pagos/giftcard/confirmar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: giftcardCode,
              amount: giftcardApplied,
              pagoId: pagoGiftcardObject.documentId, 
              source: "credito_interno" 
            }),
          });

          const confirmData = await confirmRes.json();
          if (!confirmRes.ok || !confirmData.success) {
             console.error("ALERTA: Crédito OK pero falló descuento Giftcard:", confirmData);
          } else {
             console.log("Pago mixto: Giftcard descontada correctamente.");
          }
      } catch (gcError) {
        console.error("Error al confirmar giftcard en pago mixto:", gcError);
      }
    }


    // 10. ÉXITO: Confirmar Pedido
    await fetch(`${STRAPI_URL}/api/pedidos/${pedidoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          estado: "preparacion",
          metodo_pago: "credito_interno",
          metadata: {
             credito_id: creditoData.data.id,
             numero_credito: nuevoNumeroCredito, // Guardamos referencia
             dias_plazo: diasPlazo,
             exito: true,
             pago_mixto: (giftcardApplied > 0),
             pago_asociado: pagoGiftcardId 
          }
        },
      }),
    });

    // 11. Enviar correo
    try {
        const logoBase64 = await getLogoBase64();
        const pedidoInfo = {
          numero_pedido: numeroPedido,
          total: amount,
          tipo_delivery: deliveryType,
          sucursal,
          direccion_envio: direccion,
          comuna_envio: comuna
        };
    
        const creditoInfo = {
          id: creditoData.data.id,
          // Usamos el número generado para el email
          numero: nuevoNumeroCredito, 
          fechaVencimiento: fechaVencimiento.toLocaleDateString("es-CL", { timeZone: "America/Santiago" }),
          plazo: diasPlazo 
        };
    
        const html = generarHtmlCreditoComprobante({
          pedido: pedidoInfo,
          credito: creditoInfo,
          cliente,
          cupoTotal,
          cupoRestante: redeemData.cupo_restante,
          logoBase64
        });
    
        await fetch(`${NEXT_PUBLIC_BASE_URL}/api/email/send`, {
          method: "POST",
          body: JSON.stringify({
            to: cliente.email,
            subject: `Confirmación de Compra - Pedido #${numeroPedido}`,
            html,
          }),
        });
    } catch (emailError) {
        console.warn("Fallo envio correo", emailError);
    }

    return NextResponse.json({
      success: true,
      cupoRestante: redeemData.cupo_restante,
      creditoId: creditoData.data.id,
      numeroCredito: nuevoNumeroCredito, // Retornamos el número al front
      pedidoId,
      cupoUsado: redeemData.usado
    });

  } catch (error: any) {
    console.error("Error fatal en flujo de crédito:", error);
    if (_pedidoId) {
       await cancelarPedido(_pedidoId, error.message || "Error inesperado en servidor");
    }
    return NextResponse.json({ success: false, message: error.message || "Error interno" }, { status: 500 });
  }
}
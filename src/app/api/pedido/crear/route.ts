import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            items,
            total,
            metodoPago,
            payerName,
            payerEmail,
            deliveryType,
            direccion,
            comuna,
            sucursal,
            giftcardCode,
            giftcardApplied
        } = body;

        console.log(metodoPago)

        //-----------------  OBTENER EL NUMERO DEL ULTIMO PEDIDO ----------------//
        // Obtener y actualizar counter
        const counterRes = await fetch(`${process.env.STRAPI_URL}/api/contadores?filters[nombre][$eq]=pedido`, {
            headers: {
                Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
            },
        });
        const counterData = await counterRes.json();
        let current = Number(counterData.data[0].valor);
        const idContadorPedido = counterData.data[0].documentId;

        // Incrementar
        const newValue = current + 1;

        //-----------------------------------------------------------------------------//



        //-------------------- CREAR NUEVO PEDIDO ------------------------------------//

        // Crear Pedido en Strapi
        const pedidoRes = await fetch(`${process.env.STRAPI_URL}/api/pedidos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
            },
            body: JSON.stringify({
                data: {
                    numero_pedido: newValue,
                    estado: "pendiente",
                    total,
                    tipo_delivery: deliveryType,
                    direccion_envio: direccion,
                    comuna_envio: comuna,
                    sucursal
                    ,

                },
            }),
        });

        const pedidoData = await pedidoRes.json();

        if (!pedidoRes.ok) {
            return NextResponse.json(
                { ok: false, error: pedidoData.error },
                { status: 400 }
            );
        }

        const pedidoId = pedidoData.data.documentId;
        const numeroPedido = pedidoData.data.numero_pedido;
        //------------------------------------------------------------------------------//



        //---------------GUARDAR NUMERO DEL NUEVO PEDIDO EN CONTADORES -----------------//

        // Guardar el nuevo valor
        await fetch(`${process.env.STRAPI_URL}/api/contadores/${idContadorPedido}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
            },
            body: JSON.stringify({
                data: { valor: numeroPedido },
            }),
        });

        //-------------------------------------------------------------------------------//



        //--------------------- Crear Items_pedido en Strapi-----------------------------//
        for (const item of items) {
            const resItem = await fetch(`${process.env.STRAPI_URL}/api/items-pedidos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.STRAPI_TOKEN}`,
                },
                body: JSON.stringify({
                    data: {
                        cantidad: item.cantidad,
                        precio_unitario: item.price,
                        subtotal: item.price * item.cantidad,
                        nombre_producto: item.name,
                        pedido: pedidoId, // FK al pedido
                        producto: item.documentId // FK al producto
                    },
                }),
            });

        }
        //------------------------------------------------------------------------//


        //------------------------OBTENER ULTIMO NUMERO DE PAGO --------------------//
        // Obtener y actualizar counter
        const counterResPago = await fetch(`${process.env.STRAPI_URL}/api/contadores?filters[nombre][$eq]=pago`, {
            headers: {
                Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
            },
        });
        const counterDataPago = await counterResPago.json();
        let currentPago = Number(counterDataPago.data[0].valor);
        const idContadorPago = counterDataPago.data[0].documentId;

        // Incrementar
        const newValuePago = currentPago + 1;

        //--------------------------------------------------------------------------//



        //---------------------- Crear registro de Pago PENDIENTE -------------------//
        const giftcardAmount = Number(giftcardApplied || 0);
        const montoRestante = Math.max(total - giftcardAmount, 0);

        const fechaChileString = new Date().toLocaleString("es-CL", {
            timeZone: "America/Santiago",
            hour12: false
        });

        const pagoRes = await fetch(`${process.env.STRAPI_URL}/api/pagos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
            },
            body: JSON.stringify({
                data: {
                    numero_pago: newValuePago,
                    proveedor: metodoPago,
                    estado: "pendiente",
                    datos_pago_cliente: { "Nombre Cliente": payerName, "Correo Cliente": payerEmail },
                    pedido: pedidoId,
                    fecha_intento_utc: new Date().toISOString(),
                    fecha_intento_cl: fechaChileString,
                    monto: montoRestante,
                    giftcard_code: giftcardCode || null,
                    giftcard_amount_applied: giftcardAmount || 0
                },
            }),
        });

        const pagoData = await pagoRes.json();

        if (!pagoRes.ok) {
            return NextResponse.json(
                { ok: false, error: pagoData.error },
                { status: 400 }
            );
        }

        const pagoId = pagoData.data.documentId;
        const numeroPago = pagoData.data.numero_pago;

        //------------------------------------------------------------------------//

        //------------------ REGISTRAR ULTIMO NUMERO DE PAGO EN CONTADORES -----------------------//

        // Guardar el nuevo valor
        await fetch(`${process.env.STRAPI_URL}/api/contadores/${idContadorPago}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
            },
            body: JSON.stringify({
                data: { valor: numeroPago },
            }),
        });
        //-----------------------------------------------------------------------------------//


        // ---------------- Crear pago adicional por Giftcard (si aplica) ----------------
        if (giftcardAmount > 0) {
            const counterResPagoGift = await fetch(
                `${process.env.STRAPI_URL}/api/contadores?filters[nombre][$eq]=pago`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
                    },
                }
            );

            const counterDataPagoGift = await counterResPagoGift.json();
            let currentPagoGift = Number(counterDataPagoGift.data[0].valor);
            const idContadorPagoGift = counterDataPagoGift.data[0].documentId;

            const newValuePagoGift = currentPagoGift + 1;

            await fetch(`${process.env.STRAPI_URL}/api/pagos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
                },
                body: JSON.stringify({
                    data: {
                        numero_pago: newValuePagoGift,
                        proveedor: "giftcard",
                        estado: "pendiente",
                        pedido: pedidoId,
                        fecha_intento_utc: new Date().toISOString(),
                        fecha_intento_cl: fechaChileString,
                        monto: giftcardAmount,
                        giftcard_code: giftcardCode,
                        giftcard_amount_applied: giftcardAmount
                    },
                }),
            });

            // actualizar contador pago
            await fetch(`${process.env.STRAPI_URL}/api/contadores/${idContadorPagoGift}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
                },
                body: JSON.stringify({
                    data: { valor: newValuePagoGift },
                }),
            });
        }

        return NextResponse.json({
            ok: true,
            pedidoId,
            pagoId,
            numeroPago,
            numeroPedido
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
    }
}
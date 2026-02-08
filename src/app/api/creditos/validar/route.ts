import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const STRAPI_URL = process.env.STRAPI_URL;
    const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

    try {
        const body = await req.json();

        const { creditoDocumentId, rutCliente, monto } = body;

        //  Validaciones Crédito
        const creditoRes = await fetch(`${STRAPI_URL}/api/creditos/${creditoDocumentId}?populate=cliente`, {
            headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
            cache: "no-store"
        });


        const creditoJson = await creditoRes.json();
        const credito = creditoJson.data;

        if (!credito || !credito.cliente) {
            return NextResponse.json({ success: false, message: "Crédito no válido" }, { status: 404 });
        }

        if (credito.cliente.rut !== rutCliente) {
            return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 });
        }

        if (credito.saldo_pendiente <= 0) {
            return NextResponse.json({ success: false, message: "Este crédito ya está pagado" }, { status: 400 });
        }

        // 3. Lógica de Monto
        let montoAPagar = 0;

        if (credito.estado === 'vencido') {
            montoAPagar = Math.round(credito.saldo_pendiente);
        } else {
            const montoSolicitado = Number(monto);
            if (!montoSolicitado || montoSolicitado <= 0) {
                return NextResponse.json({ success: false, message: "El monto debe ser mayor a 0" }, { status: 400 });
            }
            // Margen $10 pesos
            if (montoSolicitado > (credito.saldo_pendiente + 10)) {
                return NextResponse.json({ success: false, message: "El monto supera la deuda total" }, { status: 400 });
            }
            montoAPagar = Math.min(montoSolicitado, Math.round(credito.saldo_pendiente));
        }


return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: any) {
        console.error("Error al validar credito para pago:", error);
        return NextResponse.json({ success: false, message: "Error interno" }, { status: 500 });
    }
}
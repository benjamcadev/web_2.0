import { NextResponse } from "next/server";
import { looksLikeOrderQuery, extractOrderNumber, detectOrderIdentifier } from "@/lib/orderUtils";

const BACKEND_IA_URL = process.env.BACKEND_IA_URL;
const BACKEND_IA_SECRET = process.env.BACKEND_IA_SECRET;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const message: string = body.input ?? "";

        // --- Detectar si el mensaje contiene número de pedido o RUT
        const { type, value } = detectOrderIdentifier(message);
        let orderNumber;
        if (type === 'orderNumber') {
            orderNumber = extractOrderNumber(message);
        }
        console.log("Detectado:", { type, value, orderNumber });

        // --- Si el mensaje parece relacionado con un pedido
        if (looksLikeOrderQuery(message) || orderNumber || type === "rut") {

            // Caso 1: Si ya tenemos número de pedido o RUT
            if (orderNumber || type === "rut") {
                const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
                const queryParam = orderNumber 
                    ? `order_number=${encodeURIComponent(orderNumber)}`
                    : `rut=${encodeURIComponent(value!)}`;

                const res = await fetch(`${base}/api/orders?${queryParam}`);
                const data = await res.json();

                return NextResponse.json({
                    response: {
                        source: "orders",
                        answer: data.message ?? data.error ?? "No se encontró información del pedido.",
                    }
                });
            }

            // Caso 2: si aún no entregó número de pedido ni RUT
            return NextResponse.json({
                response: {
                    answer: "¡Claro! Con gusto te ayudo. Por favor, indícame el **número de pedido** o tu **RUT** 🔍",
                    source: "orders",
                },
            });
        }

        // --- Si no es un pedido, reenviar al backend de IA
        const response = await fetch(`${BACKEND_IA_URL}/chat`, {
            method: "POST",
            body: JSON.stringify({ query: message }),
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Error del backend IA: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (err) {
        console.error("Error en /api/chat:", err);
        return NextResponse.json({ error: "Error interno en el servidor." }, { status: 500 });
    }
}



// --- Función para intentar extraer el número de pedido (#1234, 1234, etc.)
export function extractOrderNumber(text: string): string | null {
    const match = text.match(/#?(\d{3,12})/); // ajusta rango según tus códigos
    return match ? match[1] : null;
}


export function looksLikeOrderQuery(text: string): boolean {
    const lower = text.toLowerCase().trim();

    // 🔹 Frases claras de seguimiento
    const trackingPhrases = [
        "estado de mi pedido",
        "dónde está mi pedido",
        "donde esta mi pedido",
        "seguimiento de mi pedido",
        "ver mi pedido",
        "rastreo de mi pedido",
        "número de pedido",
        "numero de pedido",
        "estado de mi compra",
        "dónde está mi compra",
        "donde esta mi compra",
        "seguimiento de mi compra",
        "ver mi compra",
        "rastreo de mi compra",
        "quiero saber sobre mi pedido",
        "quiero saber cuando llegara mi compra"
    ];

    // Si coincide con alguna frase típica de seguimiento
    if (trackingPhrases.some((phrase) => lower.includes(phrase))) {
        return true;
    }

    // 🔹 Casos donde se mencionan palabras como “pedido”, “orden” o “compra”
    // pero con verbos de acción como “hacer”, “crear”, “realizar”, “quiero”, etc.
    const actionVerbs = /\b(hacer|realizar|crear|nuevo|quiero|deseo|necesito|me gustaría)\b/;

    // Si menciona “pedido” u “orden” pero no está creando uno → seguimiento
    if (/\b(pedido|orden)\b/.test(lower) && !actionVerbs.test(lower)) {
        return true;
    }

    // Si menciona “compra” en contexto de estado o seguimiento
    if (
        /\bcompra\b/.test(lower) &&
        /\b(estado|seguimiento|dónde|donde|ver|rastreo)\b/.test(lower)
    ) {
        return true;
    }

    return false;
}

/**
 * Detecta si el texto del usuario contiene un número de pedido o un RUT chileno.
 * Devuelve un objeto con el tipo detectado y el valor limpio.
 */
export function detectOrderIdentifier(text: string): { type: "orderNumber" | "rut" | null; value?: string } {
    const cleaned = text.trim().toLowerCase();

    // Si es solo un número → número de pedido
    if (/^\d+$/.test(cleaned)) {
        return { type: "orderNumber", value: cleaned };
    }

    // Detectar RUT chileno (con o sin puntos, guion o dígito verificador)
    const rutRegex = /^(\d{1,2}\.?\d{3}\.?\d{3}-?[\dkk])$/i;

    if (rutRegex.test(cleaned)) {
        // Normalizar el formato del RUT (sin puntos, con guion)
        const normalized = cleaned
            .replace(/\./g, "")
            .replace(/(\d+)([kK\d])$/, (_, num, dv) => `${num}-${dv.toUpperCase()}`);
        return { type: "rut", value: normalized };
    }

    // No se detectó identificador válido
    return { type: null };
}


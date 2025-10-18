
// --- Función para intentar extraer el número de pedido (#1234, 1234, etc.)
export function extractOrderNumber(text: string): string | null {
    const match = text.match(/#?(\d{3,12})/); // ajusta rango según tus códigos
    return match ? match[1] : null;
}


export function looksLikeOrderQuery(text: string): boolean {
  const lower = text.toLowerCase().trim();

  // Palabras relacionadas con pedidos
  const orderWords = ["pedido", "orden", "compra", "envío", "envio", "paquete", "entrega"];

  // Palabras de seguimiento o estado
  const trackingWords = [
    "estado",
    "rastreo",
    "seguimiento",
    "entregado",
    "llegará",
    "llegara",
    "recibido",
    "despachado",
  ];

  // Verbos o frases de consulta/pregunta
  const queryWords = [
    "quiero",
    "saber",
    "ver",
    "cuando",
    "sobre",
    "dónde",
    "donde",
    "me gustaría",
    "necesito",
    "consulta",
    "información",
    "info",
  ];

  // Detecta si hay al menos una palabra de pedido
  const hasOrderWord = orderWords.some(word => lower.includes(word));

  // Detecta si hay alguna palabra de seguimiento o verbo de consulta
  const hasTrackingOrQuery = trackingWords.some(word => lower.includes(word)) ||
                             queryWords.some(word => lower.includes(word));

  return hasOrderWord && hasTrackingOrQuery;
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


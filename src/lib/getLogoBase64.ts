export async function getLogoBase64(): Promise<string | null> {
  try {
    // Obtener configuración desde Strapi
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/configuracions?populate=logo_empresa_correo`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
        cache: "no-store", // importante para emails
      }
    );

    const json = await res.json();

    const logoUrl =
      json?.data[0].logo_empresa_correo?.url;

    if (!logoUrl) return null;

    // Construir URL absoluta
    const fullLogoUrl = logoUrl.startsWith("http")
      ? logoUrl
      : `${process.env.STRAPI_URL}${logoUrl}`;

    // 3️⃣ Descargar imagen
    const imageRes = await fetch(fullLogoUrl);
    const arrayBuffer = await imageRes.arrayBuffer();

    // 4️⃣ Convertir a base64
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // 5️⃣ Detectar tipo (png / jpg)
    const contentType =
      imageRes.headers.get("content-type") || "image/png";

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Error obteniendo logo base64:", error);
    return null;
  }
}

export async function getLogoBase64Web(): Promise<string | null> {
  try {
    const res = await fetch(
      `${process.env.STRAPI_URL}/api/configuracions?populate=logo_empresa_web`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    const json = await res.json();

    const logoUrl =
      json?.data?.[0]?.logo_empresa_web?.url;

    if (!logoUrl) return null;

    const fullLogoUrl = logoUrl.startsWith("http")
      ? logoUrl
      : `${process.env.STRAPI_URL}${logoUrl}`;

    const imageRes = await fetch(fullLogoUrl);
    const arrayBuffer = await imageRes.arrayBuffer();

    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const contentType =
      imageRes.headers.get("content-type") || "image/png";

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Error obteniendo logo web base64:", error);
    return null;
  }
}
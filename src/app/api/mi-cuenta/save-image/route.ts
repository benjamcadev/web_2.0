import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL!;
const STRAPI_API_TOKEN = process.env.STRAPI_TOKEN!;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("image") as File | null;
    const documentId = formData.get("documentId") as string | null;

    if (!file || !documentId) {
      return NextResponse.json(
        { error: "Falta imagen o documentId" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo (solo imágenes)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Solo JPG, PNG o WEBP." },
        { status: 400 }
      );
    }

    // Validar tamaño (máx 2MB)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "La imagen no puede superar los 2MB." },
        { status: 400 }
      );
    }

    // Subir imagen a Strapi
    const uploadFormData = new FormData();
    uploadFormData.append("files", file);

    const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: uploadFormData,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error("Error subiendo imagen:", err);
      return NextResponse.json(
        { error: "Error subiendo imagen" },
        { status: 500 }
      );
    }

    const uploadJson = await uploadRes.json();
    const uploadedFile = uploadJson[0];

    if (!uploadedFile?.id) {
      return NextResponse.json(
        { error: "No se pudo obtener archivo subido" },
        { status: 500 }
      );
    }

    // Asociar imagen al cliente (campo logo)
    const updateRes = await fetch(
      `${STRAPI_URL}/api/clientes/${documentId}?populate=logo`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            logo: uploadedFile.id,
          },
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      console.error("Error asociando imagen al cliente:", err);
      return NextResponse.json(
        { error: "Error actualizando cliente" },
        { status: 500 }
      );
    }

    let clienteJson = await updateRes.json();
    let clienteParaFrontend = clienteJson.data;

    // Fallback: refetch con populate si no viene logo
    if (!clienteParaFrontend?.logo) {
      const refetchRes = await fetch(
        `${STRAPI_URL}/api/clientes/${documentId}?populate=logo`,
        {
          headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
          },
        }
      );

      if (refetchRes.ok) {
        const refetchJson = await refetchRes.json();
        clienteParaFrontend = refetchJson.data;
      }
    }

    return NextResponse.json({
      success: true,
      cliente: clienteParaFrontend,
    });
  } catch (error) {
    console.error("Error en save-image:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

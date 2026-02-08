import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    // 1. Obtener parámetros (RUT, page, pageSize)
    const rut = searchParams.get("rut");
    // Si no vienen, usamos valores por defecto (página 1, 5 elementos)
    const page = searchParams.get("page") || "1"; 
    const pageSize = searchParams.get("pageSize") || "5";

    if (!rut) {
      return NextResponse.json(
        { success: false, message: "El RUT del cliente es obligatorio" },
        { status: 400 }
      );
    }

    // 2. Construir la Query string para Strapi
    const queryParams = new URLSearchParams();
    
    // Filtro por RUT
    queryParams.append("filters[cliente][rut][$eq]", rut);
    
    // Relaciones (Populate)
    queryParams.append("populate[0]", "pedido");
    queryParams.append("populate[1]", "pagos");
    
    // Orden
    queryParams.append("sort", "createdAt:desc");
    
    // --- PAGINACIÓN DINÁMICA ---
    // Ya no usamos el "100" fijo, sino lo que pida el frontend
    queryParams.append("pagination[page]", page);
    queryParams.append("pagination[pageSize]", pageSize);
    
    // (Opcional) forzar que Strapi devuelva el conteo total
    queryParams.append("pagination[withCount]", "true"); 

    // 3. Consultar a Strapi
    const res = await fetch(`${STRAPI_URL}/api/creditos?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      cache: "no-store", 
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error Strapi completo:", JSON.stringify(errorData, null, 2));
      return NextResponse.json(
        { success: false, message: "Error al obtener créditos desde el servidor" },
        { status: 500 }
      );
    }

    const data = await res.json();

    // 4. Retornar los datos Y la metadata
    // Strapi devuelve la estructura: { data: [...], meta: { pagination: { ... } } }
    return NextResponse.json({
      success: true,
      creditos: data.data || [],
      meta: data.meta // <--- IMPORTANTE: Enviamos esto al frontend para calcular las páginas
    });

  } catch (error: any) {
    console.error("Error en API listar créditos:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
// app/api/subcategorias/route.ts
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoriaId = searchParams.get("categoria");

    // Si hay categoría, filtrar por ella
    let url = `${process.env.STRAPI_URL_API}/sub-categorias?sort=nombre:asc&populate=*`;
    
    if (categoriaId) {
      url += `&filters[categoria][id][$eq]=${categoriaId}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) throw new Error(`Error en Strapi: ${res.status}`);

    const data = await res.json();

    

    const subcategorias = data.data.map((item: any) => ({
      id: item.id,
      name: item.nombre,
      slug: item.slug,
      categoriaId: item.categoria?.id || null,
    }));

    return NextResponse.json({
      subcategorias,
    });
  } catch (error) {
    console.error("Error al obtener subcategorías:", error);
    return NextResponse.json(
      { error: "Error al obtener subcategorías" },
      { status: 500 }
    );
  }
}
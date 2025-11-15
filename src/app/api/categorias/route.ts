
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(req: Request) {
  try {
    const res = await fetch(
      `${process.env.STRAPI_URL_API}/categorias?sort=nombre:asc&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) throw new Error(`Error en Strapi: ${res.status}`);

    const data = await res.json();

    const categorias = data.data.map((item: any) => ({
      id: item.id,
      name: item.nombre,
      slug: item.slug,
      imagen: item.imagen.formats?.small?.url || item.imagen.url
    }));

    return NextResponse.json({
      categorias,
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
// app/api/productos/route.ts
import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "12";
    const sort = searchParams.get("sort") || "default";
    const categoria = searchParams.get("categoria");
    const subcategorias = searchParams.get("subcategorias");
    const oferta = searchParams.get("oferta");

    let sortQuery = "";
    if (sort === "price:asc") sortQuery = "&sort=price:asc";
    else if (sort === "price:desc") sortQuery = "&sort=price:desc";
    else if (sort === "recent") sortQuery = "&sort=createdAt:desc";

    // Construir filtros
    let filtrosQuery = "";
    
    // Filtro por categoría
    if (categoria) {
      filtrosQuery += `&filters[categoria][slug][$eq]=${categoria}`;
    }
    
    // Filtro por subcategorías (múltiples)
    if (subcategorias) {
      const subcatsArray = subcategorias.split(",");
      subcatsArray.forEach((subcat, index) => {
        filtrosQuery += `&filters[sub_categoria][slug][$in][${index}]=${subcat}`;
      });
    }
    
    // Filtro por ofertas
    if (oferta === "true") {
      filtrosQuery += `&filters[oferta][$eq]=true`;
    }

    let url = `${process.env.STRAPI_URL_API}/productos?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}${sortQuery}${filtrosQuery}`

    console.log(url)
    const res = await fetch(url,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) throw new Error(`Error en Strapi: ${res.status}`);

    const data = await res.json();

    const productos = data.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      slug: item.slug,
      images:
        item.images?.map((img: any) => ({
          url: img.formats.small?.url || img.url ,
        })) || [],
      oferta: item.oferta,
    }));

    

    return NextResponse.json({
      productos,
      meta: data.meta.pagination,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}
// app/api/banner/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.STRAPI_URL_API}/banners?filters[estado][$eq]=true&filters[$or][0][aviso_inicial][$eq]=false&filters[$or][1][aviso_inicial][$null]=true&sort=posicion:asc&populate=*`);
    const data = await res.json();
    
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Error al traer banners:", error);
    return NextResponse.json({ error: "Error al traer banners" }, { status: 500 });
  }
}

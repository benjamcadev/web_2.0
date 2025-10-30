import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.STRAPI_URL_API}/productos?filters[categoria_especials][nombre][$eq]=biodegradable&populate[categoria_especials][fields]=nombre,tipo_temporada,color,titulo_temporada&populate[images][fields]=name,url`);
    const data = await res.json();
    
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Error al traer productos biodegradables:", error);
    return NextResponse.json({ error: "Error al traer productos" }, { status: 500 });
  }
}

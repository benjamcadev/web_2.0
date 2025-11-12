import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.STRAPI_URL_API}/clientes?filters[mostrar_inicio][$eq]=true&populate=*`);
    const data = await res.json();
    
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Error al traer clientes de pantalla inicio:", error);
    return NextResponse.json({ error: "Error al traer clientes de pantalla inicio" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.STRAPI_URL_API}/sucursals?populate=*`);
    const data = await res.json();
    
    return NextResponse.json(data.data);
  } catch (error) {
    console.error("Error al traer sucursales:", error);
    return NextResponse.json({ error: "Error al traer sucursales" }, { status: 500 });
  }
}

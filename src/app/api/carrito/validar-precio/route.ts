// app/api/carrito/validar-precio/route.ts
// app/api/carrito/validar-precio/route.ts
import { NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL_API;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const carrito = body.carrito;

    if (!Array.isArray(carrito)) {
      return NextResponse.json({ ok: false, error: "Formato inválido" }, { status: 400 });
    }

    const discrepancias: any[] = [];

    for (const item of carrito) {
      // 1. Obtener producto actualizado desde Strapi usando documentId
      const response = await fetch(
        `${STRAPI_URL}/api/productos?filters[documentId][$eq]=${item.documentId}`,
        {
          headers: {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await response.json();
      const producto = data?.data?.[0];

      if (!producto) {
        // Producto no existe o borrado
        discrepancias.push({
          id: item.id,
          tipo: "no_existe",
          nombre: item.name,
          mensaje: `El producto "${item.name}" ya no está disponible.`
        });
        continue;
      }

      // 2. Calcular precio real según lógica de oferta
      // Convertimos a Number para asegurar comparación correcta
      const precioBase = Number(producto.price);
      const precioOferta = Number(producto.price_oferta);
      const enOferta = producto.oferta === true;

      // Si oferta es true Y hay un precio de oferta válido, ese es el real. Si no, el base.
      const precioReal = (enOferta && precioOferta > 0) ? precioOferta : precioBase;

      // 3. Comparar con el precio del carrito
      const precioCarrito = Number(item.price);

      if (precioCarrito !== precioReal) {
        discrepancias.push({
          id: item.id,
          documentId: item.documentId,
          tipo: "cambio_precio",
          nombre: producto.name || item.name,
          precio_carrito: precioCarrito,
          precio_real: precioReal,
        });
      }
    }

    return NextResponse.json({
      ok: discrepancias.length === 0,
      discrepancias,
    });

  } catch (error: any) {
    console.error("Error validando precios:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno al validar precios" }, 
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL!;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN!;

interface CarritoItem {
  id: string | number;
  documentId: string;
  cantidad: number;
  name?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const carrito: CarritoItem[] = body.carrito;
    const sessionId: string = body.sessionId;

    if (!Array.isArray(carrito) || !sessionId) {
      return NextResponse.json(
        { ok: false, error: "Carrito o sessionId inválidos" },
        { status: 400 }
      );
    }

    const resultados: any[] = [];

    for (const item of carrito) {
      
      const productoDocumentId = item.documentId;
      const cantidadSolicitada = item.cantidad ?? 1;
      const nombreProducto = item.name ?? "Producto";

      // --- 1) Obtener producto por documentId ---
      const productoRes = await fetch(
        `${STRAPI_URL}/api/productos?filters[documentId][$eq]=${encodeURIComponent(
          productoDocumentId
        )}`,
        {
          headers: {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          },
        }
      );

      const productoData = await productoRes.json();
      const producto = productoData?.data?.[0];

     

      if (!producto) {
        resultados.push({
          id: item.id,
          estado: "producto_no_encontrado",
          nombre: nombreProducto,
        });
        continue;
      }

      const productoId = producto.documentId;
      const stockTotal = producto.stock_total ?? 0;
      const stockDisponible = producto.stock_disponible ?? 0;
      const stockReservado = producto.stock_reservado ?? 0;

      // --- 2) Buscar SOLO la reserva ACTIVA más reciente de esta sesión + producto ---
      const reservaRes = await fetch(
        `${STRAPI_URL}/api/reserva-stocks?` +
          `filters[session_id][$eq]=${encodeURIComponent(sessionId)}` +
          `&filters[producto][documentId][$eq]=${encodeURIComponent(
            productoDocumentId
          )}` +
          `&filters[estado][$eq]=activa` +
          `&sort=createdAt:desc`,
        {
          headers: {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          },
        }
      );

      const reservaData = await reservaRes.json();
      const reservaActiva = reservaData?.data?.[0];

      // 🔹 Caso 1: ya existe una reserva ACTIVA para este producto + sesión
      if (reservaActiva) {
        resultados.push({
          id: item.id,
          estado: "ok",
          nombre: nombreProducto,
          stock_disponible: stockDisponible,
          reserva_estado: "activa",
        });
        continue;
      }

      // 🔹 Caso 2: NO hay reserva activa → revisar stock_disponible
      if (stockDisponible >= cantidadSolicitada) {
        // 2.1) Crear nueva reserva ACTIVA
        const expiraEn = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        const responseUpdate = await fetch(`${STRAPI_URL}/api/reserva-stocks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          },
          body: JSON.stringify({
            data: {
              session_id: sessionId,
              cantidad: cantidadSolicitada,
              estado: "activa",
              expira_en: expiraEn,
              producto: productoId,
            },
          }),
        });

        

        // 2.2) Actualizar stock del producto
        const nuevoStockDisponible = stockDisponible - cantidadSolicitada;
        const nuevoStockReservado = stockReservado + cantidadSolicitada;

        await fetch(`${STRAPI_URL}/api/productos/${productoId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          },
          body: JSON.stringify({
            data: {
              stock_disponible: nuevoStockDisponible,
              stock_reservado: nuevoStockReservado,
              stock_total: stockTotal, // normalmente no cambia aquí
            },
          }),
        });

        resultados.push({
          id: item.id,
          estado: "ok",
          nombre: nombreProducto,
          stock_disponible: nuevoStockDisponible,
          reserva_estado: "nueva_reserva",
        });

        continue;
      }

      // 🔹 Caso 3: NO hay reserva activa y NO hay stock suficiente
      resultados.push({
        id: item.id,
        estado: "sin_stock",
        nombre: nombreProducto,
        stock_disponible: stockDisponible,
      });
    }

    // --- 3) Determinar si todo está OK ---
    const hayProblemas = resultados.some((r) => r.estado !== "ok");

    return NextResponse.json({
      ok: !hayProblemas,
      resultados,
    });
  } catch (error: any) {
    console.error("Error en /api/reservas-stock/confirmar:", error);
    return NextResponse.json(
      { ok: false, error: error.message ?? "Error inesperado" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "sessionId faltante" },
        { status: 400 }
      );
    }

    // 1) Buscar reservas activas de esa session
    const reservasRes = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/reserva-stocks?filters[session_id][$eq]=${sessionId}&filters[estado][$eq]=activa&populate=producto`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
      }
    );

    const reservasData = await reservasRes.json();
    const reservas = reservasData.data;

   

    if (!reservas || reservas.length === 0) {
      return NextResponse.json({
        ok: false,
        error: "No hay reservas activas para esta sessionId",
      });
    }

    // 2) Procesar cada reserva
    for (const r of reservas) {
      const reservaId = r.documentId;
      const cantidadReservada = r.cantidad;
      const producto = r.producto;
      const productoId = producto.documentId;

      const stockTotal = producto.stock_total;
      const stockReservado = producto.stock_reservado;

      // 2.1) Cambiar estado reserva → completada
      const responseReservaEstado = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/reserva-stocks/${reservaId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
          },
          body: JSON.stringify({
            data: {
              estado: "completada",
            },
          }),
        }
      );

      // 2.2) Actualizar stock del producto
      await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${productoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
          },
          body: JSON.stringify({
            data: {
              stock_total: stockTotal - cantidadReservada,
              stock_reservado: stockReservado - cantidadReservada,
            },
          }),
        }
      );
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Reservas completadas y stock actualizado",
    });

  } catch (error: any) {
    console.error("Error completando reserva:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

// app/api/reservas-stock/limpiar/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { session_id } = await request.json();

    // Buscar todas las reservas activas de esta sesión
    const reservasResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/reserva-stocks?` +
      `filters[session_id][$eq]=${session_id}&` +
      `filters[estado][$eq]=activa&` +
      `populate=producto`,
      { cache: 'no-store',
         method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
        }
       }
    );

    const reservasData = await reservasResponse.json();
    const reservas = reservasData.data;

    

    // Liberar stock de cada reserva
    for (const reserva of reservas) {
      const productoId = reserva.producto.documentId;
      const cantidad = reserva.cantidad;

      // Obtener producto
      const productoResponse = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${productoId}`,
        { cache: 'no-store',
           method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
        }
         }
      );
      const productoData = await productoResponse.json();
      const producto = productoData.data;

      // Devolver stock a disponible
      await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${productoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
           },
          body: JSON.stringify({
            data: {
              stock_disponible: producto.stock_disponible + cantidad,
              stock_reservado: Math.max(0, producto.stock_reservado - cantidad)
            }
          }),
        }
      );

      // Marcar reserva como cancelada
      await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/reserva-stocks/${reserva.documentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
           },
          body: JSON.stringify({
            data: { estado: 'cancelada' }
          }),
        }
      );
    }

    return NextResponse.json({ 
      message: 'Reservas limpiadas correctamente',
      cantidad_liberada: reservas.length 
    });
  } catch (error) {
    console.error('Error al limpiar reservas:', error);
    return NextResponse.json(
      { error: { message: 'Error al limpiar reservas' } },
      { status: 500 }
    );
  }
}
// app/api/reservas-stock/liberar/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { producto_id, cantidad, session_id } = await request.json();

    // Buscar reservas activas de este producto para esta sesión
    const reservasResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/reserva-stocks?` +
      new URLSearchParams({
        'filters[producto][documentId][$eq]': producto_id,
        'filters[session_id][$eq]': session_id,
        'filters[estado][$eq]': 'activa',
        'populate': 'producto' // Importante: popular la relación
      }),
      {
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
        }
      }
    );

    const reservasData = await reservasResponse.json();
    const reservas = reservasData.data;

    

    if (reservas.length === 0) {
      return NextResponse.json({ message: 'No hay reservas para liberar' });
    }

    // Obtener datos del producto
    const productoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${producto_id}`,
      {
        cache: 'no-store',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
        }
      }
    );

    const productoData = await productoResponse.json();
    const producto = productoData.data;


    let cantidadALiberar = cantidad;

    for (const reserva of reservas) {
      if (cantidadALiberar <= 0) break;

      const cantidadReserva = reserva.cantidad;
      const cantidadLiberar = Math.min(cantidadALiberar, cantidadReserva);

      if (cantidadLiberar >= cantidadReserva) {
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
      } else {
        // Reducir cantidad de la reserva
        await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/reserva-stocks/${reserva.documentId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
             },
            body: JSON.stringify({
              data: { cantidad: cantidadReserva - cantidadLiberar }
            }),
          }
        );
      }

      cantidadALiberar -= cantidadLiberar;
    }

    // Actualizar stock del producto (devolver a disponible)
    await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${producto_id}`,
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

    return NextResponse.json({ message: 'Stock liberado correctamente' });
  } catch (error) {
    console.error('Error al liberar stock:', error);
    return NextResponse.json(
      { error: { message: 'Error al liberar stock' } },
      { status: 500 }
    );
  }
}
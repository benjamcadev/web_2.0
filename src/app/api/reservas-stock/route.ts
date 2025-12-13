// app/api/reservas-stock/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    
    // Validar que hay stock disponible antes de reservar
    const productoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${body.data.producto}`,
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
    
    const stockDisponible = producto.stock_disponible || 0;

    
    if (stockDisponible < body.data.cantidad) {
      return NextResponse.json(
        { 
          error: { 
            message: `Solo hay ${stockDisponible} unidades disponibles` 
          } 
        },
        { status: 400 }
      );
    }
    
    // Crear reserva en Strapi
    const reservaResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/reserva-stocks`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
         },
        body: JSON.stringify(body),
      }
    );

    

    if (!reservaResponse.ok) {
      throw new Error('Error al crear reserva');
    }

    // Actualizar stock del producto (restar de disponible, sumar a reservado)
   const responseUpdateStock = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/productos/${body.data.producto}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`
         },
        body: JSON.stringify({
          data: {
            stock_disponible: stockDisponible - body.data.cantidad,
            stock_reservado: (producto.stock_reservado || 0) + body.data.cantidad
          }
        }),
      }
    );

    const reservaData = await reservaResponse.json();
    
    return NextResponse.json({
      ...reservaData,
      stock_disponible: stockDisponible - body.data.cantidad
    });
  } catch (error) {
    console.error('Error en reserva de stock:', error);
    return NextResponse.json(
      { error: { message: 'Error al reservar stock' } },
      { status: 500 }
    );
  }
}
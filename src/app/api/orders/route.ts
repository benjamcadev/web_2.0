// app/api/orders/route.ts
import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL!;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN!;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get('order_number');
  const rut = url.searchParams.get('rut');

  if (!orderNumber && !rut) {
    return NextResponse.json({ error: 'order_number o rut requerido' }, { status: 400 });
  }


  try {

    let fetchUrl;

    if (rut) {
      fetchUrl = `${STRAPI_URL}/pedidos?filters[cliente][rut][$eq]=${encodeURIComponent(rut)}&populate=cliente`;
    }
    if (orderNumber) {
      fetchUrl = `${STRAPI_URL}/pedidos?filters[numero][$eq]=${encodeURIComponent(orderNumber)}&populate=cliente`;
    }

    if (fetchUrl) {
      const res = await fetch(fetchUrl, { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } })


      if (!res.ok) {
        console.error('Strapi error', await res.text());
        return NextResponse.json({ error: 'Error al consultar Strapi' }, { status: 502 });
      }
      const payload = await res.json();

      if (!payload.data || payload.data.length === 0) {
        return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
      }

      //iterar si tiene varios pedidos
      if (payload.data && payload.data.length > 0) {
        // Construimos un mensaje para todos los pedidos
        const clienteNombre = payload.data[0].cliente.nombre;
        let fullMessage = `¡Hola **${clienteNombre}**! 👋 Aquí tienes el estado de tus pedidos:\n\n`;


        payload.data.forEach((order: { numero: number; estado: string; cliente: { nombre: any; }; fecha_envio: string | number | Date; fecha_entrega: string | number | Date; }, index: number) => {
          const orderNumber = order.numero;

          const message = `📦 Pedido #${orderNumber} - Estado: **${order.estado.toUpperCase()}**  
          ${order.estado == 'preparacion' ? 'Nuestro equipo lo está alistando con cuidado para que llegue a ti lo antes posible. 🚀' : ''}
${order.fecha_envio && order.estado !== 'entregado' && order.estado !== 'cancelado'
              ? `Está en camino con nuestra empresa de transporte y pronto llegará a tu dirección 📦🚚. Tenemos una fecha estimada de entrega el 📅 ${new Date(order.fecha_envio).toLocaleDateString('es-CL')}.`
              : ''}
${order.estado === 'entregado'
              ? `Tu pedido fue entregado con éxito el ${order.fecha_entrega ? new Date(order.fecha_entrega).toLocaleDateString('es-CL') : 'fecha no disponible'} ✅. Esperamos que disfrutes tu compra 😄.`
              : ''}
`;

          // Agregamos un separador entre pedidos si hay más de uno
          fullMessage += message;
          if (index < payload.data.length - 1) fullMessage += "\n-------------------------\n";
        });

        fullMessage += `Si tienes alguna duda o necesitas ayuda, estamos aquí para asistirte 💬.\n\nPuedes contactarnos al ☎️ **(51) 222 21211**.`

        return NextResponse.json({
          total_orders: payload.data.length,
          message: fullMessage,
        });
      } else {
        return NextResponse.json({ error: 'Falta Rut o Número de orden o no se encontraron pedidos.' }, { status: 404 });
      }




    } else {
      return NextResponse.json({ error: 'Falta Rut o Numero de orden' }, { status: 404 });
    }

    













  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

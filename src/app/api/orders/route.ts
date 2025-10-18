// app/api/orders/route.ts
import { NextResponse } from 'next/server';

import { Order } from "../../../types/chat";

const STRAPI_URL = process.env.STRAPI_URL!;
const STRAPI_TOKEN = process.env.STRAPI_TOKEN!;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderNumber = url.searchParams.get('order_number');
    const rut = url.searchParams.get('rut');
    const showOrders = url.searchParams.get('showOrders') === 'true'; // 🔹 Parámetro para mostrar pedidos después de validación

    if (!orderNumber && !rut) {
      return NextResponse.json({ error: 'order_number o rut requerido' }, { status: 400 });
    }

    let fetchUrl;
    if (rut) {
      fetchUrl = `${STRAPI_URL}/pedidos?filters[cliente][rut][$eq]=${encodeURIComponent(rut)}&populate=cliente`;
    }
    if (orderNumber) {
      fetchUrl = `${STRAPI_URL}/pedidos?filters[numero][$eq]=${encodeURIComponent(orderNumber)}&populate=cliente`;
    }

    const res = await fetch(fetchUrl!, { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } });
    if (!res.ok) {
      console.error('Strapi error', await res.text());
      return NextResponse.json({ error: 'Error al consultar Strapi' }, { status: 502 });
    }

    const payload = await res.json();
    if (!payload.data || payload.data.length === 0) {
      return NextResponse.json({
        message: `Lamentablemente no hemos podido encontrar un pedido con los datos que proporcionaste 📦❌.
Por favor, revisa que el RUT o número de pedido estén correctos. Si necesitas ayuda puedes contactarnos al ☎️ (51) 222 21211.`
      }, { status: 404 });
    }

    const cliente = payload.data[0].cliente;

    // Si es una búsqueda por RUT y NO es para mostrar pedidos, pedir confirmación de seguridad
    if (rut && !showOrders) {
      // DEVOLVER LOS DATOS DEL CLIENTE PARA QUE EL FRONTEND VALIDE LOCALMENTE
      return NextResponse.json({
        requireConfirmation: true,
        message: "Por seguridad, necesito que confirmes tu **correo** o **teléfono** asociado al RUT.\n\n📝 Por favor responde con tu correo (ej: usuario@email.com) o teléfono (ej: +56912345678).",
        clientData: {
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
        }
      });
    }

    // Construir mensaje para todos los pedidos encontrados
    const clienteNombre = cliente.nombre;
    let fullMessage = `¡Hola **${clienteNombre}**! 👋 Aquí tienes el estado de tus pedidos:\n\n`;

    payload.data.slice(0, 5).forEach((order: Order, index: number) => { //limitado a los ultimos 5 pedidos
      const orderNumber = order.numero;
      const estado = order.estado?.toLowerCase() || 'pendiente';

      let statusMessage = '';
      
      if (estado === 'preparacion') {
        statusMessage = 'Nuestro equipo lo está alistando con cuidado para que llegue a ti lo antes posible. 🚀';
      } else if (estado === 'enviado' || estado === 'en_transito') {
        if (order.fecha_envio) {
          statusMessage = `Está en camino con nuestra empresa de transporte y pronto llegará a tu dirección 📦🚚. Tenemos una fecha estimada de entrega el 📅 ${new Date(order.fecha_envio).toLocaleDateString('es-CL')}.`;
        }
      } else if (estado === 'entregado') {
        statusMessage = `Tu pedido fue entregado con éxito el ${order.fecha_entrega ? new Date(order.fecha_entrega).toLocaleDateString('es-CL') : 'fecha no disponible'} ✅. Esperamos que disfrutes tu compra 😄.`;
      }

      const message = `📦 Pedido #${orderNumber} - Estado: **${estado.toUpperCase().replace('_', ' ')}**  
${statusMessage}
`;

      fullMessage += message;
      if (index < payload.data.length - 1) fullMessage += "\n-------------------------\n";
    });

    fullMessage += `\n\nSi tienes alguna duda o necesitas ayuda, estamos aquí para asistirte 💬.\n\nPuedes contactarnos al ☎️ **(51) 222 21211**.`;

    return NextResponse.json({
      total_orders: payload.data.length,
      message: fullMessage,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
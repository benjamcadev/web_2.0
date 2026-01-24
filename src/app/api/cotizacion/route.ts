import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Sucursal } from '@/types/sucursales'
import { generarHtmlCorreoCotizacion, generarHtmlCorreoCotizacionCliente } from '@/lib/emailsHtml/generarHtmlCotizacion'


async function crearCotizacionEnStrapi(body: any) {
  const strapiUrl = process.env.STRAPI_URL;
  const token = process.env.STRAPI_TOKEN;

  if (!strapiUrl || !token) {
    throw new Error("STRAPI_URL o STRAPI_API_TOKEN no están configurados.");
  }

  // 1️⃣ Crear cotización
  const cotizacionRes = await fetch(`${strapiUrl}/api/cotizacions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        nombre: body.cliente.nombre,
        apellidos: body.cliente.apellidos,
        rut: body.cliente.rut,
        email: body.cliente.email,
        telefono: body.cliente.telefono,
        direccion: body.cliente.direccion,
        provincia: body.cliente.provincia,
        comuna: body.cliente.comuna,
        solicitud_especial: body.cliente.solicitudEspecial,
        total: body.totalPrice,
        estado: "pendiente",
      }
    }),
  });

  const cotizacionData = await cotizacionRes.json();

  if (!cotizacionRes.ok) {
    console.error("Error al crear cotización:", cotizacionData);
    throw new Error("No se pudo crear la cotización en Strapi");
  }

  const cotizacionId = cotizacionData.data.documentId;


  // 2️⃣ Guardar cada item del carrito como item de cotización
  for (const item of body.items) {
    await fetch(`${strapiUrl}/api/items-cotizacions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          cotizacion: cotizacionId,
          producto: item.documentId,
          nombre: item.name,
          cantidad: item.cantidad,
          precio_unitario: item.price,
          precio_total: item.price * item.cantidad,
        }
      }),
    });
  }

  return cotizacionData.data.id;
}




// Función para determinar la sucursal según la comuna
function determinarSucursal(comuna: string, sucursales: Sucursal[]) {
  const comunaNormalizada = comuna.toLowerCase().trim();

  for (const sucursal of sucursales) {
    const comunaEncontrada = sucursal.comunas.find(
      c => c.toLowerCase() === comunaNormalizada
    );
    if (comunaEncontrada) {
      return sucursal;
    }
  }

  // Por defecto, enviar a La Serena si no se encuentra la comuna
  return sucursales[1];
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cliente, items, totalPrice } = body;

    // Validar datos requeridos
    if (!cliente || !items || !totalPrice) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }


    // Traer sucursales
    let url = `${process.env.STRAPI_URL_API}/sucursals?sort=posicion:asc&populate=*`
    const res = await fetch(url,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
        },
      }
    );
    if (!res.ok) throw new Error(`Error en Strapi: ${res.status}`);

    const { data: sucursales } = await res.json();

    // Determinar sucursal según comuna
    const sucursal = determinarSucursal(cliente.comuna, sucursales);

    // Guardar cotización en Strapi
    const cotizacionId = await crearCotizacionEnStrapi(body);

    const htmlSucursal = generarHtmlCorreoCotizacion({ items, sucursal, cliente, totalPrice, cotizacionId });
    const htmlCliente = generarHtmlCorreoCotizacionCliente({ items, sucursal, cliente, totalPrice, cotizacionId });


    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send`, {
      method: "POST",
      body: JSON.stringify({
        to: sucursal.correo,
        subject: `Nueva Cotización - ${cliente.nombre} ${cliente.apellidos}`,
        html: htmlSucursal,
      }),
    });

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send`, {
      method: "POST",
      body: JSON.stringify({
        to: cliente.email,
        subject: 'Confirmación de Solicitud de Cotización',
        html: htmlCliente,
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Cotización enviada exitosamente',
      sucursal: sucursal.nombre,
      cotizacionId: cotizacionId
    });

  } catch (error) {
    console.error('Error al enviar cotización:', error);
    return NextResponse.json(
      { error: 'Error al procesar la cotización' },
      { status: 500 }
    );
  }
}
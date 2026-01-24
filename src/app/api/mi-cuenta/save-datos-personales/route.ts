import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/logAudit'


export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      nombre,
      apellidos,
      razon_social,
      giro,
      email,
      telefono,
      documentId,
      rut
    } = body
    

    // Autenticación (placeholder)
    //const session = await validateSession(cookies())
    const session = true;
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const strapiUrlApi = process.env.STRAPI_URL_API
    const strapiToken = process.env.STRAPI_TOKEN

    if (!strapiUrlApi || !strapiToken) {
      return NextResponse.json(
        { error: 'Configuración de Strapi incompleta' },
        { status: 500 }
      )
    }

    // PATCH a Strapi usando documentId
    const resStrapi = await fetch(
      `${strapiUrlApi}/clientes/${documentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${strapiToken}`,
        },
        body: JSON.stringify({
          data: {
            nombre,
            apellidos,
            razon_social,
            giro,
            email,
            telefono,
          },
        }),
      }
    )

    if (!resStrapi.ok) {
      const errorText = await resStrapi.text()
      console.error('Error Strapi:', errorText)

      return NextResponse.json(
        { error: 'Error al actualizar datos en Strapi' },
        { status: 500 }
      )
    }

    const clienteActualizado = await resStrapi.json()

     // Registar en log
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "unknown";

     await logAudit({
            event_type: "CLIENT_DATA",
            level: "INFO",
            message: "Cliente edita sus datos",
            ip,
            rut,
           
        });


    return NextResponse.json({
      success: true,
      cliente: clienteActualizado.data,
    })
  } catch (error) {
    console.error('Error save-datos-personales', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

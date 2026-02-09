import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/logAudit'

export async function PUT(req: Request) {
    try {
        const body = await req.json()

        const {
            documentId,
            id, // El ID de la dirección que estamos editando
            calle,
            numero,
            complemento,
            comuna,
            ciudad,
            es_principal,
            rut
        } = body

        if (!documentId || !id || !calle || !numero) {
            return NextResponse.json(
                { error: 'Datos incompletos' },
                { status: 400 }
            )
        }

        const STRAPI_URL = process.env.STRAPI_URL_API
        const STRAPI_API_TOKEN = process.env.STRAPI_TOKEN

        // 1. Obtener cliente actual
        const clienteRes = await fetch(
            `${STRAPI_URL}/clientes/${documentId}?populate=direcciones`,
            { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } }
        )

        if (!clienteRes.ok) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

        const clienteJson = await clienteRes.json()
        const cliente = clienteJson.data
        const direccionesActuales = cliente.direcciones ?? []

        // 2. Construir el nuevo array de direcciones
        // Strapi v4 Components: Para actualizar uno, hay que enviar TODOS de nuevo.
        
        const direccionesActualizadas = direccionesActuales.map((dir: any) => {
            // Si es la dirección que estamos editando:
            if (dir.id === id) {
                return {
                    calle,
                    numero,
                    complemento: complemento || null,
                    comuna,
                    ciudad,
                    es_principal: !!es_principal // Asignamos el nuevo valor
                }
            }
            
            // Si NO es la que editamos, pero la que editamos ahora es PRINCIPAL,
            // tenemos que quitarle el principal a las demás.
            if (es_principal) {
                return {
                    calle: dir.calle,
                    numero: dir.numero,
                    complemento: dir.complemento,
                    comuna: dir.comuna,
                    ciudad: dir.ciudad,
                    es_principal: false // Forzamos false porque la editada ahora es true
                }
            }

            // Si no hay cambios de estado principal ni es la editada, se devuelve limpia (sin ID para evitar conflictos en algunos casos, o tal cual)
            return {
                calle: dir.calle,
                numero: dir.numero,
                complemento: dir.complemento,
                comuna: dir.comuna,
                ciudad: dir.ciudad,
                es_principal: dir.es_principal
            }
        })

        // 3. Enviar actualización a Strapi
        const updateRes = await fetch(
            `${STRAPI_URL}/clientes/${documentId}?populate=direcciones`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
                body: JSON.stringify({
                    data: {
                        direcciones: direccionesActualizadas,
                    },
                }),
            }
        )

        if (!updateRes.ok) {
            console.error(await updateRes.text())
            return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
        }

        // 4. Obtener respuesta para el frontend
        let clienteActualizadoJson = await updateRes.json()
        let clienteParaFrontend = clienteActualizadoJson.data

        // Fallback refetch si es necesario
        if (!clienteParaFrontend?.direcciones) {
            const refetchRes = await fetch(`${STRAPI_URL}/clientes/${documentId}?populate=direcciones`, {
                headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
            })
            if (refetchRes.ok) {
                const r = await refetchRes.json()
                clienteParaFrontend = r.data
            }
        }

        // Log
        await logAudit({
            event_type: "CLIENT_DATA",
            level: "INFO",
            message: "Cliente edita direccion",
            rut,
            metadata: { info_extra: `Editada ID ${id}: ${calle} ${numero}` },
        });

        return NextResponse.json({
            success: true,
            cliente: clienteParaFrontend,
        })

    } catch (error) {
        console.error('update-direccion error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
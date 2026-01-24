import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/logAudit'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const {
            documentId,
            calle,
            numero,
            complemento,
            comuna,
            ciudad,
            es_principal,
            rut
        } = body

        if (!documentId || !calle || !numero || !comuna || !ciudad) {
            return NextResponse.json(
                { error: 'Datos incompletos' },
                { status: 400 }
            )
        }

        const STRAPI_URL = process.env.STRAPI_URL_API
        const STRAPI_API_TOKEN = process.env.STRAPI_TOKEN

        if (!STRAPI_URL || !STRAPI_API_TOKEN) {
            return NextResponse.json(
                { error: 'Configuración de Strapi incompleta' },
                { status: 500 }
            )
        }

        /**
         * Obtener cliente actual con direcciones
         */
        const clienteRes = await fetch(
            `${STRAPI_URL}/clientes/${documentId}?populate=direcciones`,
            {
                headers: {
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                },
            }
        )


        if (!clienteRes.ok) {
            return NextResponse.json(
                { error: 'Cliente no encontrado' },
                { status: 404 }
            )
        }

        const clienteJson = await clienteRes.json()
        const cliente = clienteJson.data

        const direccionesActuales = cliente.direcciones ?? []

        const direccionesLimpias = direccionesActuales.map((dir: any) => ({
            calle: dir.calle,
            numero: dir.numero,
            complemento: dir.complemento,
            comuna: dir.comuna,
            ciudad: dir.ciudad,
            es_principal: es_principal ? false : dir.es_principal,
        }))

        const direccionesActualizadas = [
            ...direccionesLimpias,
            {
                calle,
                numero,
                complemento: complemento || null,
                comuna,
                ciudad,
                es_principal: !!es_principal,
            },
        ]

        /**
         * PATCH cliente con direcciones actualizadas
         */
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
            const err = await updateRes.text()
            console.error('Error actualizando direcciones:', err)

            return NextResponse.json(
                { error: 'Error al guardar dirección' },
                { status: 500 }
            )
        }

        let clienteActualizadoJson = await updateRes.json()
        let clienteParaFrontend = clienteActualizadoJson.data

        // Fallback: si por alguna razón no viene con direcciones, refetch
        if (!clienteParaFrontend?.direcciones) {
            const refetchRes = await fetch(
                `${STRAPI_URL}/clientes/${documentId}?populate=direcciones`,
                {
                    headers: {
                        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                    },
                }
            )

            if (refetchRes.ok) {
                const refetchJson = await refetchRes.json()
                clienteParaFrontend = refetchJson.data
            }
        }

        // Registar en log
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "unknown";

        await logAudit({
            event_type: "CLIENT_DATA",
            level: "INFO",
            message: "Cliente agrega nueva direccion",
            ip,
            rut,
            metadata: {
                info_extra: `Cliente agrega direccion ${calle} ${numero}, ${ciudad}`,
            },
        });

        return NextResponse.json({
            success: true,
            cliente: clienteParaFrontend,
        })
    } catch (error) {
        console.error('save-direccion error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
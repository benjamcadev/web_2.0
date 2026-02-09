import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/logAudit'

export async function DELETE(req: Request) {
    try {
        const body = await req.json()

        const {
            documentId,
            id, // El ID de la dirección a eliminar
            rut
        } = body

        // 1. Validaciones básicas
        if (!documentId || !id) {
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
         * 2. Obtener cliente actual con direcciones
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

        // 3. Filtrar y Preparar el payload
        // Primero verificamos si la dirección existe para loguear o validar
        const direccionAEliminar = direccionesActuales.find((d: any) => d.id === id);

        if (!direccionAEliminar) {
             return NextResponse.json(
                { error: 'Dirección no encontrada' },
                { status: 404 }
            )
        }

        // Filtramos la dirección que queremos borrar
        const direccionesFiltradas = direccionesActuales.filter((dir: any) => dir.id !== id)

        // Mapeamos a la estructura limpia (sin IDs) tal como lo haces en el endpoint de guardar
        // Esto es crucial en Strapi cuando se actualizan componentes vía PUT para evitar conflictos
        const direccionesParaGuardar = direccionesFiltradas.map((dir: any) => ({
            calle: dir.calle,
            numero: dir.numero,
            complemento: dir.complemento,
            comuna: dir.comuna,
            ciudad: dir.ciudad,
            es_principal: dir.es_principal,
        }))

        /**
         * 4. PUT cliente con el array de direcciones actualizado (menos la borrada)
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
                        direcciones: direccionesParaGuardar,
                    },
                }),
            }
        )

        if (!updateRes.ok) {
            const err = await updateRes.text()
            console.error('Error eliminando dirección:', err)

            return NextResponse.json(
                { error: 'Error al eliminar dirección' },
                { status: 500 }
            )
        }

        let clienteActualizadoJson = await updateRes.json()
        let clienteParaFrontend = clienteActualizadoJson.data

        // Fallback de refetch (Igual que en tu endpoint de guardar)
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

        // 5. Registrar en Log (Auditoría)
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "unknown";

        await logAudit({
            event_type: "CLIENT_DATA",
            level: "INFO",
            message: "Cliente elimina direccion",
            ip,
            rut,
            metadata: {
                info_extra: `Eliminada: ${direccionAEliminar.calle} ${direccionAEliminar.numero}`,
            },
        });

        return NextResponse.json({
            success: true,
            cliente: clienteParaFrontend,
        })

    } catch (error) {
        console.error('delete-direccion error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
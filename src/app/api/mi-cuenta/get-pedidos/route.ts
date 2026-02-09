import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const documentId = searchParams.get('documentId')
        
        // Valores por defecto
        const page = searchParams.get('page') || '1'
        const pageSize = searchParams.get('pageSize') || '5'

        if (!documentId) {
            return NextResponse.json({ error: 'Faltan datos (documentId)' }, { status: 400 })
        }

        const STRAPI_URL = process.env.STRAPI_URL_API
        const STRAPI_API_TOKEN = process.env.STRAPI_TOKEN

        if (!STRAPI_URL || !STRAPI_API_TOKEN) {
            return NextResponse.json({ error: 'Error de configuración' }, { status: 500 })
        }

        // --- CONSTRUCCIÓN DE LA QUERY SEGURA ---
        const queryParams = new URLSearchParams();
        
        // 1. Filtros
        queryParams.append('filters[cliente][documentId][$eq]', documentId);
        
        // 2. Orden y Paginación
        queryParams.append('sort', 'createdAt:desc');
        queryParams.append('pagination[page]', page);
        queryParams.append('pagination[pageSize]', pageSize);
        
        // 3. Populate (LA PARTE CLAVE)
        
        // A) Items Pedidos: Entramos y pedimos explícitamente el 'producto'
        // Esto evita usar '*' y asegura que traigamos el nombre del producto.
        queryParams.append('populate[items_pedidos][populate][0]', 'producto'); 
        
        // B) Pagos: NO USAMOS '*'. 
        // Usamos 'true' para indicar que queremos la relación (sus campos básicos)
        // pero sin profundizar en relaciones anidadas (como el 'pedido' padre).
        queryParams.append('populate[pagos]', 'true');

        // Debug: Imprimir la URL generada en consola del servidor para verificar
        const finalUrl = `${STRAPI_URL}/pedidos?${queryParams.toString()}`;
        console.log("Fetching Strapi URL:", finalUrl);

        const res = await fetch(finalUrl, {
            headers: {
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        })

        if (!res.ok) {
            // Ver el error real de Strapi si vuelve a fallar
            const errorText = await res.text();
            console.error("❌ Error Strapi:", errorText);
            return NextResponse.json({ error: 'Error al obtener datos de Strapi' }, { status: res.status })
        }

        const data = await res.json()

        return NextResponse.json({
            success: true,
            pedidos: data.data,
            meta: data.meta
        })

    } catch (error) {
        console.error('get-pedidos error:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
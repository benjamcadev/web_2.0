// src/app/api/search/route.ts
// src/app/api/search/route.ts
import { NextResponse } from 'next/server';
import { MeiliSearch } from 'meilisearch';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_ADMIN_API_KEY || process.env.MEILISEARCH_API_KEY;
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

// Validar que tenemos la API Key
if (!MEILISEARCH_API_KEY) {
  console.error('❌ MEILISEARCH_API_KEY no está configurada en las variables de entorno');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5');

    // Si no hay query, devolver array vacío
    if (!query.trim()) {
      return NextResponse.json({ results: [], query: '', total: 0 });
    }

    // Inicializar cliente de Meilisearch
    const client = new MeiliSearch({
      host: MEILISEARCH_HOST,
      apiKey: MEILISEARCH_API_KEY,
    });

    const index = client.index('productos');

    // Realizar búsqueda
    const searchResults = await index.search(query, {
      limit,
      attributesToRetrieve: [
        'id',
        'name',
        'slug',
        'price',
        'stock',
        'image_url',
        'categoria',
      ],
      attributesToHighlight: ['name', 'description'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    });

    // Formatear resultados para incluir URL completa de imagen
    const results = searchResults.hits.map((hit: any) => ({
      id: hit.id,
      name: hit.name,
      slug: hit.slug,
      price: hit.price || 0,
      stock: hit.stock || 0,
      image_url: hit.image_url ? `${STRAPI_URL}${hit.image_url}` : null,
      categoria: hit.categoria || '',
      // Si quieres usar el highlighting
      _formatted: hit._formatted,
    }));

    return NextResponse.json({
      results,
      query,
      total: searchResults.estimatedTotalHits || 0,
      processingTimeMs: searchResults.processingTimeMs,
    });

  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
    return NextResponse.json(
      { 
        error: 'Error al realizar la búsqueda',
        results: [],
        query: '',
        total: 0
      },
      { status: 500 }
    );
  }
}
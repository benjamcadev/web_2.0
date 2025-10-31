import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slugCategoria = searchParams.get('slugCategoria') || '';

  const strapiUrl = `${process.env.STRAPI_URL_API}/productos?populate[0]=categoria&populate[1]=images&filters[categoria][slug][$eq]=${slugCategoria}&pagination[pageSize]=1000`;

  const res = await fetch(strapiUrl);
  const data = await res.json();

  return NextResponse.json(data);
}

import Header from "@/components/client/Header/Header";
import Horarios from '@/components/client/Horarios'
import Productos from "./Productos";
import Filtros from "./Filtros";

export default async function TiendaPage({ 
  searchParams, 
}: { 
  searchParams: { 
    page?: string;
    categoria?: string;
    oferta?: string;
  }; 
}) {

  //rescatamos variables de la url query
  const params = await searchParams;
  const page = Number(params.page) || 1;

  // traemos sucursales
  const resSucursales = await fetch(`${process.env.STRAPI_URL_API}/sucursals?sort=posicion:asc&populate=*`);
  const { data: sucursales } = await resSucursales.json();

  return (
    <main className="">
      <Horarios sucursales={sucursales} />
      <Header />
      <div className="flex flex-row">
        <Filtros />
        <Productos page={page} />
      </div>
    </main>
  );
}
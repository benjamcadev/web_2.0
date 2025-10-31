import Banner from '@/components/client/Banner/Banner';
import Header from '../components/client/Header'
import Horarios from '../components/client/Horarios'
import SeccionProductos from '../components/client/SeccionProductos/SeccionProductos'
import BannerInicial from '@/components/client/BannerInicial';
import Categorias from '@/components/client/Categorias/Categorias';


export const metadata = {
  title: "Web 2.0",
  description: "Productos biodegradables y de temporada",
};

export const viewport = {
  themeColor: "#0f172a", // color del navegador
};


export default async function Home() {


  const resSucursales = await fetch(`${process.env.STRAPI_URL_API}/sucursals?sort=posicion:asc`, {
  });
  const { data: sucursales } = await resSucursales.json();

  const resBannerInicial = await fetch(`${process.env.STRAPI_URL_API}/banners?filters[estado][$eq]=true&filters[aviso_inicial][$eq]=true&sort=posicion:asc&populate=*`, {
  });
  const { data: bannerInicial } = await resBannerInicial.json();






  return (
    <main className="">
      {bannerInicial.length >= 1 ? <BannerInicial banner={bannerInicial[0]}/> : ''}
      <Horarios sucursales={sucursales} />
      <Header />
      <Banner />
      <SeccionProductos />
      <Categorias />
    </main>
  );
}

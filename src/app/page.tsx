import Banner from '@/components/client/banner/Banner';
import Header from '../components/client/Header'
import Horarios from '../components/client/Horarios'
import IndexSeccionProductos from '../components/client/SeccionProductos/IndexSeccionProductos'

export const metadata = {
  title: "Web 2.0",
  description: "Productos biodegradables y de temporada",
};

export const viewport = {
  themeColor: "#0f172a", // color del navegador
};


export default async function Home() {


  const res = await fetch(`${process.env.STRAPI_URL_API}/sucursals?sort=posicion:asc`, {
  });
  const { data } = await res.json();

  console.log(data)



  return (
    <main className="">
      <Horarios sucursales={data} />
      <Header />
      <Banner />
      <IndexSeccionProductos />
    </main>
  );
}

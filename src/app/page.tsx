import HomeClient from "@/components/client/HomeClient";

export const metadata = {
  title: "Web 2.0",
  description: "Productos biodegradables y de temporada",
};

export const viewport = {
  themeColor: "#0f172a",
};

export default async function Home() {
  const resSucursales = await fetch(`${process.env.STRAPI_URL_API}/sucursals?sort=posicion:asc`);
  const { data: sucursales } = await resSucursales.json();

  const resBannerInicial = await fetch(
    `${process.env.STRAPI_URL_API}/banners?filters[estado][$eq]=true&filters[aviso_inicial][$eq]=true&sort=posicion:asc&populate=*`
  );
  const { data: bannerInicial } = await resBannerInicial.json();

  const resCategorias = await fetch(
    `${process.env.STRAPI_URL_API}/categorias?sort=nombre:asc&populate=*`
  );
  const { data: categorias } = await resCategorias.json();

  return (
    <HomeClient
      sucursales={sucursales}
      bannerInicial={bannerInicial}
      categorias={categorias}
    />
  );
}

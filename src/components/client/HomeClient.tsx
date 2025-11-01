"use client";

import dynamic from "next/dynamic";
import Banner from "@/components/client/Banner/Banner";
import Header from "@/components/client/Header";
import SeccionProductos from "@/components/client/SeccionProductos/SeccionProductos";
import BannerInicial from "@/components/client/BannerInicial";
import Categorias from "@/components/client/Categorias/Categorias";

// Import dinámico SIN SSR, válido porque este archivo es "use client"
const Horarios = dynamic(() => import("@/components/client/Horarios"), {
  ssr: false,
});

export default function HomeClient({ sucursales, bannerInicial, categorias }: any) {
  return (
    <main>
      {bannerInicial.length >= 1 ? <BannerInicial banner={bannerInicial[0]} /> : ""}
      <Horarios sucursales={sucursales} />
      <Header />
      <Banner />
      <SeccionProductos />
      <Categorias categorias={categorias} />
    </main>
  );
}

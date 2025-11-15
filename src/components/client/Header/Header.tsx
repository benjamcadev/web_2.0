
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomeIcon, Bars3Icon, XMarkIcon, ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Queue from "./Queue";
import SearchBar from "./SearchBar";
import { useCart } from "@/hooks/useCart";
import { useHydration } from "@/hooks/useHydration";
import { Manrope } from "next/font/google";
import { formatCLP } from "@/lib/formatCLP";


const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Header() {
  const [active, setActive] = useState("Inicio");
  const [open, setOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [peopleQueuing] = useState(5);
  const links2 = [{ nombre: "Inicio", href: "/" }, { nombre: "Tienda", href: "/tienda" }, { nombre: "Empresas", href: "/empresas" }]
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items, getTotalItems, getTotalPrice } = useCart();
  const [animar, setAnimar] = useState(false);

  // Evitar error de hidratación
  const isHydrated = useHydration();

  //  Solo ejecutar getTotalItems() después de hidratar
  const totalItems = isHydrated ? getTotalItems() : 0;
  const totalPrice = isHydrated ? getTotalPrice() : 0;

  useEffect(() => {
    setAnimar(true);
    setTimeout(() => setAnimar(false), 5000);
  }, [totalItems])
  return (
    <>

      <header className="sticky top-0 z-50 m-3 bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl shadow-lg px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo a la izquierda */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Image
              src="/logo.webp"
              alt="Logo Agroplastic"
              width={250}
              height={80}
              className="drop-shadow-lg hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all duration-300"
            />
          </div>

          {/* Buscador en el centro (solo desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <SearchBar />
          </div>

          {/* Botón hamburguesa en móvil */}
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
          >
            {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>

          {/* Menú desktop + iconos */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
            <nav className="flex space-x-8">
              {links2.map((link) => (
                <Link key={link.nombre} href={link.href}>
                  <span
                    onClick={() => setActive(link.nombre)}
                    className={`cursor-pointer text-black text-lg pb-1 transition-all ${active === link.nombre
                      ? "font-bold border-b-2 border-black"
                      : "font-normal hover:font-semibold hover:border-b hover:border-gray-400"
                      }`}
                  >
                    {link.nombre === "Inicio" ? (
                      <HomeIcon className="h-6 w-6 text-black" />
                    ) : (
                      link.nombre
                    )}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Separador */}
            <div className="h-6 w-px bg-black"></div>

            {/* Fila de tienda */}
            <div
              className="relative cursor-pointer group"
              onClick={() => setIsQueueOpen(true)}
            >
              <UserGroupIcon className="h-7 w-7 text-black" />
              {peopleQueuing > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full z-10">
                  {peopleQueuing}
                </span>
              )}
              <span className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 p-2 whitespace-nowrap bg-gray-800 text-white text-sm rounded shadow-lg z-20 hidden group-hover:block">
                Personas esperando en fila en la tienda
              </span>
            </div>

            {/* Separador */}
            <div className="h-6 w-px bg-black"></div>

            {/* Carrito - ACTUALIZADO */}
            <div
              className="relative cursor-pointer group"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCartIcon className="h-7 w-7 text-black transition-transform group-hover:scale-110" />

              {isHydrated && totalItems > 0 && (
                <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold ${animar ? 'animate-pulse' : ''}`}>
                  {totalItems}
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Menú móvil */}
        {open && (
          <div className="md:hidden mt-4 space-y-4">
            {/* Buscador móvil */}
            <div className="px-2">
              <SearchBar />
            </div>

            {/* Links de navegación */}
            <nav className="flex flex-col items-center space-y-4 py-4">
              {links2.map((link) => (
                <Link key={link.nombre} href={link.href}>
                  <span
                    onClick={() => {
                      setActive(link.nombre);
                      setOpen(false);
                    }}
                    className={`cursor-pointer text-black text-lg pb-1 transition-all ${active === link.nombre
                      ? "font-bold border-b-2 border-black"
                      : "font-normal hover:font-semibold hover:border-b hover:border-gray-400"
                      }`}
                  >
                    {link.nombre === "Inicio" ? (
                      <HomeIcon className="h-6 w-6 text-black" />
                    ) : (
                      link.nombre
                    )}
                  </span>
                </Link>
              ))}

              {/* Personas en fila */}
              <div
                className="relative mt-4 cursor-pointer"
                onClick={() => setIsQueueOpen(true)}
              >
                <UserGroupIcon className="h-7 w-7 text-black" />
                {peopleQueuing > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {peopleQueuing}
                  </span>
                )}
              </div>

              {/* Carrito móvil - ACTUALIZADO */}
              <Link href="/carrito" className="relative mt-4">
                <ShoppingCartIcon className="h-7 w-7 text-black" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Modal de Fila */}
      <Queue isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />

      {/* Modal del Carrito */}
      {isCartOpen && (
        <div
          className={`${manrope.className} fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-[100]`}
          onClick={() => setIsCartOpen(false)}
        >
          <div
            className="w-full max-w-sm h-full rounded-2xl bg-white/80 backdrop-blur-lg border border-white/30 shadow-xl p-6 flex flex-col animate-slide-left"
            onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer click adentro
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tu carrito</h2>

              <button
                className="p-1 rounded hover:bg-gray-200 transition"
                onClick={() => setIsCartOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-gray-700" />
              </button>
            </div>

           

            {/* Items del carrito */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center">Tu carrito está vacío.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 border-b pb-3">
                    <img
                      src={process.env.NEXT_PUBLIC_STRAPI_URL + item.images[0].url}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">x{item.cantidad}</p>
                    </div>
                    <span className="font-bold">{formatCLP(item.price * item.cantidad)}</span>
                  </div>
                ))
              )}
            </div>

            {/* Total del carrito */}
            {items.length > 0 && (
              <div className="mt-4 flex justify-between items-center text-lg font-bold border-t pt-4">
                <span>Total:</span>
                <span>{formatCLP(totalPrice)}</span>
              </div>
            )}

            {/* Botón Ir al Carrito */}
            <Link
              href="/carrito"
              className="w-full text-white font-bold py-2 rounded-xl transition-colors bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-400/50
             border border-white/40 
             hover:shadow-lg hover:scale-105
             transition-all duration-300 text-center"
              onClick={() => setIsCartOpen(false)}
            >
              Ir al carrito
            </Link>
          </div>
        </div>
      )}

    </>


  );
}
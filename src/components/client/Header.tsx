
"use client";

import { useState } from "react";
import Image from "next/image";
import { HomeIcon, Bars3Icon, XMarkIcon, ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Queue from "./Queue";
import SearchBar from "./SearchBar";

export default function Header() {
  const [active, setActive] = useState("Inicio");
  const [open, setOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [cartCount] = useState(3);
  const [peopleQueuing] = useState(5);
  const links = ["Inicio","Tienda", "Empresas"];

  return (
    <>
      <header className="sticky top-0 z-50 m-3 bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl shadow-lg px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo a la izquierda */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Image
              src="/logo.webp"
              alt="Logo Agroplastic"
              width={200}
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
              {links.map((link) => (
                <button
                  key={link}
                  onClick={() => setActive(link)}
                  className={`text-black text-lg pb-1 transition-all ${
                    active === link
                      ? "font-bold border-b-2 border-black"
                      : "font-normal hover:font-semibold hover:border-b hover:border-gray-400"
                  }`}
                >
                  {link === "Inicio" ? (
                    <HomeIcon className="h-6 w-6 text-black" />
                  ) : (
                    link
                  )}
                </button>
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

            {/* Carrito */}
            <div className="relative cursor-pointer">
              <ShoppingCartIcon className="h-7 w-7 text-black" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
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
              {links.map((link) => (
                <button
                  key={link}
                  onClick={() => {
                    setActive(link);
                    setOpen(false);
                  }}
                  className={`text-black text-lg pb-1 transition-all ${
                    active === link
                      ? "font-bold border-b-2 border-black"
                      : "font-normal hover:font-semibold hover:border-b hover:border-gray-400"
                  }`}
                >
                  {link === "Inicio" ? (
                    <HomeIcon className="h-6 w-6 text-black" />
                  ) : (
                    link
                  )}
                </button>
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

              {/* Carrito móvil */}
              <div className="relative mt-4">
                <ShoppingCartIcon className="h-7 w-7 text-black" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Modal de Fila */}
      <Queue isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
}
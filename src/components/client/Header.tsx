
"use client";

import { useState } from "react";
import Image from "next/image";
import { HomeIcon, Bars3Icon, XMarkIcon, ShoppingCartIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import Queue from "./Queue";

export default function Header() {
  const [active, setActive] = useState("Inicio");
  const [open, setOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cartCount, setCartCount] = useState(3);
  const [peopleQueuing, setPeopleQueuing] = useState(5);
  const links = ["Inicio", "Nosotros", "Tienda"];

  return (
    <>
      <header className="m-3 bg-white shadow-sm rounded-2xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo a la izquierda */}
          <div className="flex items-center space-x-2">
            <Image src="/logo.webp" alt="Logo" width={180} height={100} />
          </div>

          {/* Botón hamburguesa en móvil */}
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
          >
            {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>

          {/* Menú desktop + carrito */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-8">
              {links.map((link) => (
                <button
                  key={link}
                  onClick={() => setActive(link)}
                  className={`text-black text-lg pb-1 transition-all ${active === link
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

            {/* Separador horizontal */}
            <div className="h-6 w-px bg-black"></div>

            {/* Ticket */}
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
              <span
                className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 p-2 whitespace-nowrap bg-gray-800 text-white text-sm rounded shadow-lg z-20 hidden group-hover:block"
              >
                Personas esperando en fila en la tienda
              </span>
            </div>

            {/* Separador horizontal */}
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
          <nav className="flex flex-col items-center space-y-4 py-4 md:hidden">
            {links.map((link) => (
              <button
                key={link}
                onClick={() => {
                  setActive(link);
                  setOpen(false);
                }}
                className={`text-black text-lg pb-1 transition-all ${active === link
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

            {/* Carrito móvil debajo */}
            <div className="relative mt-4">
              <ShoppingCartIcon className="h-7 w-7 text-black" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Modal de Fila */}
      <Queue isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </>
  );
}
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface BannerInicialProps {
  banner: any; // tipalo según tu modelo de Strapi
}

export default function BannerInicial({ banner }: BannerInicialProps) {
  const [isOpen, setIsOpen] = useState(true); // control del modal
  const [isVisible, setIsVisible] = useState(true); // control de animación

  let STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

  if (!banner) return null;

  const imageUrl = banner.imagen?.url;

  const handleClose = () => {
    setIsVisible(false); // inicia la animación de salida
    setTimeout(() => setIsOpen(false), 300); // esperar la animación antes de remover
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-80 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-lg max-w-lg w-full h-fit p-4 relative transform transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold text-xl"
        >
          &times;
        </button>

        {/* Imagen */}
        {imageUrl && (
          <Link href={banner.url || "#"} target="_blank">
            <Image
              src={STRAPI_URL + banner.imagen.url}
              alt={banner.titulo || "Banner Inicial"}
              width={800}
              height={800}
              className="w-full h-full rounded cursor-pointer"
              priority
            />
          </Link>
        )}
      </div>
    </div>
  );
}

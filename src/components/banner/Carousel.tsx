
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState<any[]>([]);

  const nextSlide = () =>
    setCurrent((prev) => (banners.length > 0 ? (prev + 1) % banners.length : 0));
  const prevSlide = () =>
    setCurrent((prev) => (banners.length > 0 ? (prev - 1 + banners.length) % banners.length : 0));

  // 🔹 Traer banners una sola vez
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banner");
        const data = await res.json();
        setBanners(data); // asegúrate de acceder al array correcto
      } catch (error) {
        console.error("Error al traer banners:", error);
      }
    };
    fetchBanners();
  }, []); // ✅ sin dependencias (solo al montar el componente)

  // ⏳ Cambio automático (solo si hay banners cargados)
  useEffect(() => {
    if (banners.length === 0) return; // evita ejecutar con 0 imágenes

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]); // ✅ se activa solo cuando los banners están listos

  if (banners.length === 0)
    return <div className="w-full h-64 bg-gray-100 rounded-2xl animate-pulse" />;

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-2xl">
      {banners.map((banner, index) => (
        <Link key={index} href={banner.url} className="block">
          <Image
            key={banner.id}
            src={`http://localhost:1337${banner.imagen.url}`}
            alt={banner.titulo}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-cover rounded-2xl absolute inset-0 transition-opacity duration-700 ease-in-out ${index === current ? "opacity-100" : "opacity-0"
              }`}
          />
        </Link>

      ))}

      {/* Botón anterior */}
      <button
        className="absolute top-1/2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-full"
        onClick={prevSlide}
      >
        {"<"}
      </button>

      {/* Botón siguiente */}
      <button
        className="absolute top-1/2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full"
        onClick={nextSlide}
      >
        {">"}
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition ${current === index ? "bg-blue-700" : "bg-gray-500 opacity-70"
              }`}
          />
        ))}
      </div>
    </div>
  );
}

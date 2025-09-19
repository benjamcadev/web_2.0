"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const images = [
  "/banner1.webp",
  "/banner2.webp",
  "/banner3.webp",
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);

  // ⏳ Cambio automático
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // cambia cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-2xl">
      {/* Imagen */}
      {images.map((img, index) => (
        <Image
          key={index}
          src={img}
          alt={`Banner ${index + 1}`}
          fill
          className={`object-cover rounded-2xl absolute inset-0 transition-opacity duration-700 ease-in-out ${index === current ? "opacity-100" : "opacity-0"
            }`}
        />
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

      {/* Dots de navegación */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
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
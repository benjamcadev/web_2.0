"use client";

import { useState, useEffect } from "react";

interface Sucursal {
  id: number;
  nombre: string;
  horarios: string;
  direccion: string;
}

export default function Horarios({ sucursales }: { sucursales: Sucursal[] }) {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // 🔹 inicia el fade-out

      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % sucursales.length);
        setFade(true); // 🔹 vuelve a hacer fade-in
      }, 500); // 500ms de animación
    }, 6000); // cambia cada 4s

    return () => clearInterval(interval);
  }, [sucursales.length]);

  const sucursal = sucursales[current];

  return (
    <div className="flex flex-row bg-blue-800 rounded-b-2xl text-amber-50 font-sans font-light text-xs h-9 sm:h-6 w-full text-center p-1 overflow-hidden">
      <p
        className={`mx-auto transition-opacity duration-500 ease-in-out ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {sucursal.nombre} — {sucursal.horarios} — {sucursal.direccion}
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react"; 

interface Sucursal {
  id: number;
  nombre: string;
  horarios: string;
  direccion: string;
  correo: string;
  telefono_1: string;
  telefono_2: string;
  telefono_movil: string;
}

export default function Horarios({ sucursales }: { sucursales: Sucursal[] }) {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % sucursales.length);
        setFade(true);
      }, 500);
    }, 10000);
    return () => clearInterval(interval);
  }, [sucursales.length]);

  const sucursal = sucursales[current];

  return (
    <div className="flex flex-col  sm:flex-row items-center bg-blue-800 rounded-b-2xl text-amber-50 font-sans font-light text-xs w-full text-center p-2 transition-all duration-500">
      {/* Texto visible siempre */}
      <div
        className={`flex-1 transition-opacity duration-500 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className=" h-8 "> 🏢 {sucursal.nombre}: 🕒 {sucursal.horarios} </span> 
        {/* En pantallas grandes muestra todo */}
        <span className="hidden sm:inline">
          {" "}
          | ☎️ {sucursal.telefono_1}{" "}
          {sucursal.telefono_2 ? "☎️" + sucursal.telefono_2 : ""}{" "}
          {sucursal.telefono_movil ? "📱" + sucursal.telefono_movil : ""} | ✉️{" "}
          {sucursal.correo} | 📍 {sucursal.direccion}
        </span>
      </div>

      {/* Botón para móviles */}
      <button
        className="sm:hidden mt-1 flex items-center gap-1 bg-amber-600 text-white rounded-full p-1 px-2 text-xs"
        onClick={() => setExpandido(!expandido)}
      >
        {expandido ? <Minus size={14} /> : <Plus size={14} />}
        {expandido ? "Ver menos" : "Ver más"}
      </button>

      {/* Información extra solo en móvil expandido */}
      {expandido && (
        <div className="sm:hidden mt-2 text-[11px] animate-fadeIn">
          ☎️ {sucursal.telefono_1}{" "}
          {sucursal.telefono_2 ? "☎️" + sucursal.telefono_2 : ""}{" "}
          {sucursal.telefono_movil ? "📱" + sucursal.telefono_movil : ""} <br />
          ✉️ {sucursal.correo} <br />📍 {sucursal.direccion}
        </div>
      )}
    </div>
  );
}

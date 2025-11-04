"use client";

import { FaWhatsapp } from "react-icons/fa";


//Renderiza los botones de contacto según el paso

interface ContactButtonsProps {
  contactStep: "initial" | "ventas-empresa" | null;
  onOptionSelect: (option: string) => void;
}

export default function ContactButtons({ contactStep, onOptionSelect }: ContactButtonsProps) {
  if (contactStep === "initial") {
    return (
      <div className="flex flex-col gap-2 my-3">
        <button
          onClick={() => onOptionSelect("Sucursal La Serena")}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
        >
          <FaWhatsapp /> Sucursal La Serena
        </button>
        <button
          onClick={() => onOptionSelect("Sucursal Ovalle")}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
        >
          <FaWhatsapp /> Sucursal Ovalle
        </button>
        <button
          onClick={() => onOptionSelect("Ventas Empresa")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Ventas Empresa
        </button>
      </div>
    );
  }

  if (contactStep === "ventas-empresa") {
    return (
      <div className="grid grid-cols-2 gap-2 my-3">
        {["Copiapó", "Vallenar", "La Serena", "Coquimbo", "Valle del Elqui", "Ovalle"].map((location) => (
          <button
            key={location}
            onClick={() => onOptionSelect(location)}
            className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition text-sm flex items-center justify-center gap-1 xl:w-64"
          >
            <FaWhatsapp className="text-base" /> {location}
          </button>
        ))}
      </div>
    );
  }

  return null;
}

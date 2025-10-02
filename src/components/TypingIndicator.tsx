"use client";

import { useEffect, useState } from "react";

export default function TypingIndicator() {
  const frases = [
  "¡Dame un segundo, estoy verificando la disponibilidad del producto! 📦",
  "Revisando la bodega para ver si tenemos el artículo... 🕵️‍♂️",
  "Ya voy a la estantería. ¡Un momento, por favor! 🏃‍♂️💨",
  "Buscando el producto... Te confirmo en un minuto si lo encontramos. 😉",
  "¡Casi lo tengo! Estoy revisando el código de barras... 🔍",
  "Validando el stock y la ubicación del producto en la bodega.",
  "Consultando el sistema de inventario... ✨",
  "Verificando si el producto está en el área de recepción. 📝",
  "Buscando el número de SKU... 🤔",
  "Coordinando con el equipo de bodega para confirmar la existencia. ✅"
];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % frases.length);
    }, 4000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="bg-gray-300 text-gray-700 px-3 py-1 rounded-2xl text-sm animate-pulse">
      {frases[index]}
    </div>
  );
}

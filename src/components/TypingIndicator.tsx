"use client";

import { useEffect, useState } from "react";

export default function TypingIndicator() {
  const frases = [
    "Analizando pregunta...",
    "Buscando productos en bodega...",
    "Buscando mejores coincidencias...",
    "Preparando respuesta..."
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % frases.length);
    }, 2000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="bg-gray-300 text-gray-700 px-3 py-1 rounded-2xl text-sm animate-pulse">
      {frases[index]}
    </div>
  );
}

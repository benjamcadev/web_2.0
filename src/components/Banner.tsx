"use client";

import React from "react";
import Carousel from "../components/Carousel"; // Componente para carrusel
import Chat from "../components/Chat";         // Componente para chat IA

export default function Banner() {
  return (
    <div className="flex flex-col md:items-center md:flex-row  mt-6 px-6 gap-6 rounded-2xl bg-blue-800 ml-3 mr-3">
      {/* Carrusel - 60% width */}
      <div className="w-full mt-4  md:w-3/5  bg-white rounded-2xl md:mt-6 md:mb-6  shadow-md p-4">
        <Carousel />
      </div>

      {/* Chat IA - 40% width */}
      <div className="w-full mb-4 md:w-2/5  bg-white rounded-2xl md:mt-6 md:mb-6 shadow-md p-4">
        <Chat />
      </div>
    </div>
  );
}


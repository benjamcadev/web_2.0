"use client";

import { FaWhatsapp } from "react-icons/fa";

interface ChatWelcomeProps {
  onContactCallcenter: () => void;
}

// Pantalla de bienvenida del chat

export default function ChatWelcome({ onContactCallcenter }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col justify-center h-72 items-center">
      <p className="text-2xl text-center">
        ¡Hola! ¿En qué te puedo ayudar hoy?
      </p>
      <p className="text-lg text-center mb-2">
        Pregunta sobre un producto o el estado de tu pedido...
      </p>
      <button
        onClick={onContactCallcenter}
        className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#1EBE5D] transition-colors duration-300 shadow-sm active:scale-95"
      >
        <span>Contactar Callcenter</span>
        <FaWhatsapp className="text-lg" />
      </button>
    </div>
  );
}

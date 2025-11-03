"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import TypingIndicator from "./TypingIndicator";
import BotMessage from './BotMessage'
import { useChatContext } from "@/context/ChatContext";
import { FaWhatsapp } from "react-icons/fa";

import { Message } from "../../../types/chat";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // 🔹 Usar el contexto global
  const { pendingRut, clientData, pendingAttempts, setPendingRut, setClientData, incrementAttempts, resetPending } = useChatContext();

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender === "user") {
      el.scrollTop = el.scrollHeight;
    } else if (lastMessage.sender === "bot") {
      el.scrollBy({ top: 100, behavior: "smooth" });
    }
  }, [messages]);

  // 🔹 Función para normalizar correos y teléfonos
  const normalizeEmail = (email: string): string => email.toLowerCase().trim();
  const normalizePhone = (phone: string): string => phone.replace(/\s+/g, '');

  // 🔹 Función para validar si es un correo
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 🔹 Función para validar si es un teléfono
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
  };

  // 🔹 Función para validar localmente en el frontend
  const validateConfirmation = (input: string): { isValid: boolean; message: string } => {
    if (!clientData) {
      return { isValid: false, message: "Error: datos del cliente no disponibles" };
    }

    const inputTrimmed = input.trim();

    // Validar si es correo o teléfono
    if (!isValidEmail(inputTrimmed) && !isValidPhone(inputTrimmed)) {
      return {
        isValid: false,
        message: "Por favor ingresa un **correo válido** (ej: usuario@email.com) o un **teléfono válido** (ej: +56912345678). ❌"
      };
    }

    // Comparar con datos guardados
    const isEmailMatch = isValidEmail(inputTrimmed) &&
      normalizeEmail(inputTrimmed) === normalizeEmail(clientData.email);
    const isPhoneMatch = isValidPhone(inputTrimmed) &&
      normalizePhone(inputTrimmed) === normalizePhone(clientData.telefono);

    if (isEmailMatch || isPhoneMatch) {
      return { isValid: true, message: "" };
    }

    return {
      isValid: false,
      message: `El correo o teléfono proporcionado no coincide con el RUT. ❌\n\nPor favor intenta de nuevo.`
    };
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // si hay un RUT pendiente, validar localmente en el frontend
      if (pendingRut && clientData) {
        const validation = validateConfirmation(input);

        if (!validation.isValid) {
          // Validación falló
          incrementAttempts();
          const remainingAttempts = 3 - (pendingAttempts + 1);

          const botMessage: Message = {
            sender: "bot",
            text: `${validation.message}\n\n📝 Intentos restantes: ${remainingAttempts}`,
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);

          // Si se acabaron los intentos
          if (pendingAttempts + 1 >= 3) {
            setTimeout(() => {
              resetPending();
              setMessages((prev) => [...prev, {
                sender: "bot",
                text: "Se ha excedido el número de intentos. Por favor, inicia nuevamente indicando tu RUT o número de pedido. ❌"
              }]);
            }, 500);
          }
          return;
        }

        // ✓ Validación exitosa → Cargar los pedidos desde el backend
        const loadingMsg: Message = {
          sender: "bot",
          text: "¡Perfecto! Cargando tus pedidos... 📦",
        };
        setMessages((prev) => [...prev, loadingMsg]);

        try {
          // 🔹 Hacer petición al backend con showOrders=true para obtener los pedidos
          const ordersResponse = await fetch(`/api/orders?rut=${encodeURIComponent(pendingRut)}&showOrders=true`);
          const ordersData = await ordersResponse.json();

          const botMessage: Message = {
            sender: "bot",
            text: ordersData.message || "Aquí están tus pedidos.",
          };
          setMessages((prev) => [...prev, botMessage]);
          resetPending();
        } catch (error) {
          console.error("Error al cargar pedidos:", error);
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "Error al cargar tus pedidos. Por favor intenta de nuevo." },
          ]);
        }
        setLoading(false);
        return;
      }

      // 🔹 Si no hay validación pendiente, enviar al backend normalmente
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ input }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      // 🔹 Si la respuesta requiere confirmación, guardar los datos
      if (data.response.requireConfirmation && data.response.clientData) {
        setPendingRut(data.response.rut);
        setClientData(data.response.clientData);
      }

      const botMessage: Message = {
        sender: "bot",
        text:
          data.response.answer ||
          "Lamentablemente no tengo respuesta, hubo un problema con la IA, favor intentar más tarde.",
        products: data.response.products || [],
        text_closing: data.response.closing || "",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error al conectar con la IA" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div
      className={`flex flex-col h-96 bg-white ${isFullScreen
        ? "fixed top-0 left-0 w-screen h-screen z-50 max-w-none max-h-none rounded-none shadow-2xl border-none"
        : "relative"
        } transition-all duration-300`}
      style={isFullScreen ? { height: '100vh' } : {}}
    >
      {/* Botón de expandir/reducir */}
      <button
        onClick={() => setIsFullScreen((v) => !v)}
        className={`absolute right-3 top-3 bg-gray-200 hover:bg-gray-300 rounded-full p-2 z-49 shadow`}
        aria-label={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
        type="button"
      >
        {isFullScreen ? (
          <ArrowsPointingInIcon className="h-5 w-5 text-gray-700" />
        ) : (
          <ArrowsPointingOutIcon className="h-5 w-5 text-gray-700" />
        )}
      </button>

      {/* Área de mensajes */}
      <div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-3 border border-gray-400 rounded-lg bg-gray-50 ${isFullScreen ? 'h-[calc(100vh-180px)]' : ''}`}
        style={isFullScreen ? { minHeight: '400px' } : {}}
      >
        {messages.length === 0 && (
          <div className="flex flex-col justify-center h-72 items-center">
            <p className="text-2xl text-center">
              ¡Hola! ¿En qué te puedo ayudar hoy?
            </p>
            <p className="text-lg text-center mb-2">
              Pregunta sobre un producto o el estado de tu pedido...
            </p>
            <button
              onClick={() => (console.log("hola"))}
              className="inline-flex  items-center gap-2 bg-[#25D366] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#1EBE5D] transition-colors duration-300 shadow-sm active:scale-95"
            >
              <span>Contactar Callcenter</span>
              <FaWhatsapp className="text-lg" />
            </button>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl text-sm whitespace-pre-line ${msg.sender === "user"
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-gray-200 text-black rounded-bl-none"
                }`}
            >
              {msg.sender === "bot" ? (
                <BotMessage msg={msg} />
              ) : (
                <span>{msg.text}</span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
      </div>

      {/* Input + botón */}
      <div className="mt-3 flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta..."
          className="flex-1 border border-gray-400 rounded-4xl bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 p-3 rounded-full hover:bg-blue-600 transition flex items-center justify-center disabled:opacity-50"
        >
          <PaperAirplaneIcon className="h-5 w-5 text-white" />
        </button>
      </div>

      <small className="text-center text-gray-500">
        Nuestra IA puede cometer errores, favor de comprobar información
      </small>
    </div>
  );
}
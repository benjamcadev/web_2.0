"use client";

import { useState } from "react";
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import TypingIndicator from "./TypingIndicator";
import BotMessage from "./BotMessage";
import ContactButtons from "./ContactButtons";
import ChatWelcome from "./ChatWelcome";
import { useChat } from '@/hooks/useChat'
import { useContactFlow } from "@/hooks/useContactFlow";
import { useOrderValidation } from "@/hooks/useOrderValidation";
import { Message } from "@/types/chat";

export default function Chat() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const {
    messages,
    setMessages,
    input,
    setInput,
    loading,
    setLoading,
    chatContainerRef,
    pendingRut,
    clientData,
    pendingAttempts,
    setPendingRut,
    setClientData,
    incrementAttempts,
    resetPending,
    resetChat,
  } = useChat();

  const { contactStep, handleContactCallcenter, handleContactOption } = useContactFlow();
  const { validateConfirmation } = useOrderValidation();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      if (pendingRut && clientData) {
        const validation = validateConfirmation(input, clientData);

        if (!validation.isValid) {
          incrementAttempts();
          const remainingAttempts = 3 - (pendingAttempts + 1);

          const botMessage: Message = {
            sender: "bot",
            text: `${validation.message}\n\n📝 Intentos restantes: ${remainingAttempts}`,
          };
          setMessages((prev) => [...prev, botMessage]);
          setLoading(false);

          if (pendingAttempts + 1 >= 3) {
            setTimeout(() => {
              resetPending();
              setMessages((prev) => [
                ...prev,
                {
                  sender: "bot",
                  text: "Se ha excedido el número de intentos. Por favor, inicia nuevamente indicando tu RUT o número de pedido. ❌",
                },
              ]);
            }, 500);
          }
          return;
        }

        const loadingMsg: Message = {
          sender: "bot",
          text: "¡Perfecto! Cargando tus pedidos... 📦",
        };
        setMessages((prev) => [...prev, loadingMsg]);

        try {
          const ordersResponse = await fetch(
            `/api/orders?rut=${encodeURIComponent(pendingRut)}&showOrders=true`
          );
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

      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ input }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

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
      className={`flex flex-col h-96 bg-white ${
        isFullScreen
          ? "fixed top-0 left-0 w-screen h-screen z-50 max-w-none max-h-none rounded-none shadow-2xl border-none"
          : "relative"
      } transition-all duration-300`}
      style={isFullScreen ? { height: "100vh" } : {}}
    >
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

      <div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-3 border border-gray-400 rounded-lg bg-gray-50 ${
          isFullScreen ? "h-[calc(100vh-180px)]" : ""
        }`}
        style={isFullScreen ? { minHeight: "400px" } : {}}
      >
        {messages.length === 0 && (
          <ChatWelcome onContactCallcenter={() => handleContactCallcenter(setMessages)} />
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl text-sm whitespace-pre-line ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-black rounded-bl-none"
              }`}
            >
              {msg.sender === "bot" ? <BotMessage msg={msg} /> : <span>{msg.text}</span>}
            </div>
          </div>
        ))}

        <ContactButtons
          contactStep={contactStep}
          onOptionSelect={(option) => handleContactOption(option, setMessages, resetChat)}
        />

        {loading && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
      </div>

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

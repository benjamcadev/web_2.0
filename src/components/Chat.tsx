"use client";

import { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import TypingIndicator from "./TypingIndicator";


interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/chat", {
        method: "POST",
        body: JSON.stringify({ query: input }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      const botMessage: Message = { sender: "bot", text: data.answer || "No tengo respuesta" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
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
    <div className="flex flex-col h-96">
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 border border-gray-400 rounded-lg bg-gray-50">
        {messages.length == 0 ? <div className="flex justify-center h-72 items-center"> <p className=" text-2xl text-center">¡Hola! ¿En qué te puedo ayudar hoy?</p> </div> : ''}
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
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}

        <div ref={chatEndRef} />
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
          className="bg-blue-500 p-3 rounded-full hover:bg-blue-600 transition flex items-center justify-center"
        >
          <PaperAirplaneIcon className="h-5 w-5 text-white" /> 
        </button>
      </div>
    </div>
  );
}

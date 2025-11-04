import { useState, useRef, useEffect } from "react";
import { useChatContext } from "@/context/ChatContext";
import { Message } from "@/types/chat";


//Maneja el estado principal del chat, mensajes, y contexto

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { 
    pendingRut, 
    clientData, 
    pendingAttempts, 
    setPendingRut, 
    setClientData, 
    incrementAttempts, 
    resetPending 
  } = useChatContext();

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender === "user") {
      el.scrollTop = el.scrollHeight;
    } else if (lastMessage.sender === "bot") {
      el.scrollBy({ top: 100, behavior: "smooth" });
    }
  }, [messages]);

  const resetChat = () => {
    setMessages([]);
    setInput("");
    resetPending();
  };

  return {
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
  };
}

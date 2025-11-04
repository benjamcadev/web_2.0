import { useState } from "react";
import { Message } from "@/types/chat";

type ContactStep = null | "initial" | "ventas-empresa";

//Maneja toda la lógica del flujo de contacto WhatsApp

export function useContactFlow() {
  const [contactStep, setContactStep] = useState<ContactStep>(null);

  const whatsappNumbers: { [key: string]: string } = {
    "Sucursal La Serena": "56912345678",
    "Sucursal Ovalle": "56912345679",
    "Copiapó": "56912345680",
    "Vallenar": "56912345681",
    "La Serena": "56912345682",
    "Coquimbo": "56912345683",
    "Valle del Elqui": "56912345684",
    "Ovalle": "56912345685",
  };

  const handleContactCallcenter = (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  ) => {
    const botMessage: Message = {
      sender: "bot",
      text: "¿Con quién deseas contactar? 📞",
    };
    setMessages((prev) => [...prev, botMessage]);
    setContactStep("initial");
  };

  const handleContactOption = (
    option: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    resetChat: () => void
  ) => {
    const userMessage: Message = { sender: "user", text: option };
    setMessages((prev) => [...prev, userMessage]);

    if (option === "Ventas Empresa") {
      const botMessage: Message = {
        sender: "bot",
        text: "Selecciona una locación por favor 📍",
      };
      setMessages((prev) => [...prev, botMessage]);
      setContactStep("ventas-empresa");
    } else if (whatsappNumbers[option]) {
      const botMessage: Message = {
        sender: "bot",
        text: `Redirigiendo a WhatsApp... 💬`,
      };
      setMessages((prev) => [...prev, botMessage]);

      setTimeout(() => {
        window.open(`https://wa.me/${whatsappNumbers[option]}`, "_blank");
        setTimeout(() => {
          resetChat();
          setContactStep(null);
        }, 1500);
      }, 1000);
    }
  };

  return {
    contactStep,
    handleContactCallcenter,
    handleContactOption,
  };
}
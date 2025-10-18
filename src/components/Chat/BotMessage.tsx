import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from "react-markdown";
import ProductCard from "../ProductCard";
import { Message } from "../../types/chat";

// Componente para renderizar cada mensaje del bot con efecto typewriter
export default function BotMessage({ msg }: { msg: Message }) {
  const [displayedText, setDisplayedText] = useState("");
  const [showExtras, setShowExtras] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    setShowExtras(false);

    const interval = setInterval(() => {
      setDisplayedText(msg.text.slice(0, i + 1));
      i++;

      // Scroll automático al final mientras se escribe
      if (messageRef.current) {
        messageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }

      if (i >= msg.text.length) {
        clearInterval(interval);
        setShowExtras(true); // mostrar productos y cierre

        // Scroll final para asegurarse que se vea todo
        if (messageRef.current) {
          messageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }
    }, 35); // velocidad por letra en ms

    return () => clearInterval(interval);
  }, [msg.text]);

  return (
    <div ref={messageRef}>
      <ReactMarkdown>{displayedText}</ReactMarkdown>
      {showExtras && (
        <>
          {msg.products?.map((product, idx) => (
            <ProductCard
              key={idx}
              name={product.name}
              url={product.url}
              image={product.images[0].url}
            />
          ))}
          {msg.text_closing}
        </>
      )}
    </div>
  );
}

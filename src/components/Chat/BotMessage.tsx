import { useState, useEffect} from 'react'
import ProductCard from "../ProductCard";

import { Message } from "../../types/chat";


// Componente para renderizar cada mensaje del bot con efecto typewriter
export default function BotMessage({ msg }: { msg: Message }) {
  const [displayedText, setDisplayedText] = useState("");
  const [showExtras, setShowExtras] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    setShowExtras(false);

    const interval = setInterval(() => {
      setDisplayedText(msg.text.slice(0, i + 1));
      i++;
      if (i >= msg.text.length) {
        clearInterval(interval);
        setShowExtras(true); // mostrar productos y cierre
      }
    }, 35); // velocidad por letra en ms

    return () => clearInterval(interval);
  }, [msg.text]);

  return (
    <div>
      <p>{displayedText}</p>
      {showExtras && (
        <>
          {msg.products?.map((product, idx) => (
            <ProductCard
              key={idx}
              name={product.name}
              url={product.url}
              image={product.image}
            />
          ))}
          {msg.text_closing}
        </>
      )}
    </div>
  );
}

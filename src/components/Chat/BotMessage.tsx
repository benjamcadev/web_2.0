'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import ProductCard from '../ProductCard';
import { Message } from '../../types/chat';

export default function BotMessage({ msg }: { msg: Message }) {
  const [displayedText, setDisplayedText] = useState('');
  const [showExtras, setShowExtras] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    setShowExtras(false);

    const interval = setInterval(() => {
      setDisplayedText(msg.text.slice(0, i + 1));
      i++;

      // Scroll automático mientras se escribe
      if (messageRef.current) {
        messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }

      if (i >= msg.text.length) {
        clearInterval(interval);
        setShowExtras(true);

        // Scroll final
        if (messageRef.current) {
          setTimeout(() => {
            messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }, 100);
        }
      }
    }, 35);

    return () => clearInterval(interval);
  }, [msg.text]);

  return (
    <div ref={messageRef} >
      <ReactMarkdown>{displayedText}</ReactMarkdown>

      {showExtras && (
        <>
          {/* Renderizar tarjetas de productos */}
          {msg.products && msg.products.length > 0 && (
            <div className="">
              {msg.products.map((product, idx) => (
                <ProductCard key={idx} product={product} />
              ))}
            </div>
          )}

          {/* Texto de cierre */}
          {msg.text_closing && (
            <p className="text-gray-600 text-sm italic mt-4">
              {msg.text_closing}
            </p>
          )}
        </>
      )}
    </div>
  );
}
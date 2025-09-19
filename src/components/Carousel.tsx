"use client";

import React, { useState } from "react";
import Image from "next/image";

const images = [
  "/banner1.webp",
  "/banner2.webp",
  "/banner3.webp",
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((current + 1) % images.length);
  const prevSlide = () => setCurrent((current - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-2xl">
      <Image
        src={images[current]}
        alt={`Banner ${current + 1}`}
        fill
        className="object-cover rounded-2xl"
      />
      {/* Botones */}
      <button
        className="absolute top-1/2 left-2 bg-black bg-opacity-50 text-white p-2 rounded-full"
        onClick={prevSlide}
      >{"<"}</button>
      <button
        className="absolute top-1/2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full"
        onClick={nextSlide}
      >{">"}</button>
    </div>
  );
}

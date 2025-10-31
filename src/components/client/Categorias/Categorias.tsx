'use client'
import React, {useState} from 'react'
import Image from 'next/image'

import { Yellowtail } from 'next/font/google'

import ModalCatalogo from './ModalCatalogo'

 const yellowtail = Yellowtail({
  weight: ['400'],
  subsets: ['latin'],
})



interface Categoria {
  id: number;
  nombre: string;
  slug: string | null;
  imagen: {
    url: string;
  } | null;
}

export default function Categorias({ categorias }: { categorias: Categoria[] }) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slugCategoria, setSlugCategoria] = useState('')

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

 
  return (
   
    <div className="relative mt-6 px-6 rounded-2xl ml-3 mr-3 overflow-hidden shadow-lg">

       {isModalOpen ? <ModalCatalogo setIsModalOpen={setIsModalOpen} slugCategoria={slugCategoria} /> : ''}

      {/* Fondo animado con degradado */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-purple-500/40 via-pink-500/40 to-yellow-400/40  animate-gradient-move bg-[length:400%_400%] rounded-2xl"></div>

      {/* Contenido */}
      <div className="relative z-10 py-18">
        {/* Título */}
        <h2 className={`${yellowtail.className} text-3xl md:text-6xl font-extrabold text-cyan-950 text-center mb-8`} style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.4)' }}>
          Soluciones para todo 
        </h2>
        <p className=' px-64 text-center pb-20' >Descubre todas nuestras categorías de productos pensadas para tu negocio.
Desde envases de aluminio, plástico o ecológicos, hasta bolsas, cotillón, librería y equipamiento gastronómico, contamos con soluciones versátiles y de calidad para cada necesidad.
Encuentra el formato ideal para tu emprendimiento o empresa y lleva tu presentación al siguiente nivel.</p>

        {/* Grid de categorías con padding interior mayor */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8 xl:gap-12 px-4 md:px-12 xl:px-15 2xl:px-30">
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              className="group md:w-48 md:h-48 lg:w-64 lg:h-64  relative bg-white/10 backdrop-blur-md rounded-4xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer aspect-[3/4]"
            >
              {/* Contenedor de imagen */}
              <div className="relative h-full w-full bg-white/20">
                {categoria.imagen?.url ? (
                  <Image
                    src={`${STRAPI_URL}${categoria.imagen.url}`}
                    alt={categoria.nombre}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                ) : (
                  // Placeholder cuando no hay imagen
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-white/70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Overlay oscuro al hacer hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              </div>

              {/* Nombre de la categoría como franja en el medio */}
              <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 bg-black/60 backdrop-blur-md py-3 px-2 transition-all duration-300 group-hover:top-1/3">
                <h3 className="text-white text-center font-bold text-xs md:text-sm lg:text-base uppercase tracking-wide">
                  {categoria.nombre}
                </h3>
              </div>

              {/* Botones que aparecen al hacer hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex flex-col gap-2">
                <button 
                  className="w-full bg-white/90 hover:bg-white text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg text-xs md:text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Ver categoría:', categoria.slug || categoria.nombre);
                  }}
                >
                  Ver Categoría en Tienda
                </button>
                
                <button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg text-xs md:text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Ver catálogo:', categoria.slug || categoria.nombre);
                    setSlugCategoria(categoria.slug || '');
                    setIsModalOpen(true);
                  }}
                >
                Ver Catálogo
                </button>
              </div>

              {/* Indicador de hover */}
              <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/50 rounded-2xl transition-colors duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay categorías */}
        {categorias.length === 0 && (
          <div className="text-center text-white/80 py-12">
            <p className="text-lg">No hay categorías disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}
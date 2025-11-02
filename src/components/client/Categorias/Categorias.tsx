'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { Yellowtail } from 'next/font/google'
import ModalCatalogo from './ModalCatalogo'

const yellowtail = Yellowtail({
  weight: ['400'],
  subsets: ['latin'],
})

interface Categoria {
  id: number
  nombre: string
  slug: string | null
  imagen: {
    url: string
  } | null
}

export default function Categorias({ categorias }: { categorias: Categoria[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [slugCategoria, setSlugCategoria] = useState('')
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL

  return (
    <div className="relative mt-10 px-6 md:px-12 rounded-3xl overflow-hidden shadow-xl">
      {/* Modal */}
      {isModalOpen && (
        <ModalCatalogo
          setIsModalOpen={setIsModalOpen}
          isModalOpen={isModalOpen}
          slugCategoria={slugCategoria}
        />
      )}

      {/* Fondo Glass */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl" />

      {/* Contenido principal */}
      <div className="relative z-10 py-16 text-center">
        {/* Título */}
        <h2
          className={`${yellowtail.className} text-5xl md:text-7xl font-bold text-white drop-shadow-lg mb-6`}
        >
          Soluciones para todo
        </h2>

        {/* Descripción */}
        <p className="max-w-3xl mx-auto text-white/90 mb-16 leading-relaxed text-base md:text-lg">
          Descubre nuestras categorías diseñadas para tu negocio. Envases, bolsas, cotillón, librería
          y más — todo con calidad, versatilidad y estilo.
        </p>

        {/* Grid de categorías */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-10 px-4 md:px-8 xl:px-12">
          {categorias.map((categoria) => (
            <div
              key={categoria.id}
              className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] cursor-pointer"
            >
              {/* Imagen con altura definida */}
              <div className="relative h-56 md:h-64 lg:h-72 w-full">
                {categoria.imagen?.url ? (
                  <Image
                    src={`${STRAPI_URL}${categoria.imagen.url}`}
                    alt={categoria.nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-all duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-white/10 text-white/70 text-sm">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Fondo oscuro centrado con el nombre */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-500 group-hover:bg-black/70">
                  <h3 className="text-white font-semibold uppercase tracking-wide text-xs md:text-sm lg:text-base text-center">
                    {categoria.nombre}
                  </h3>
                </div>
              </div>

              {/* Botones (aparecen al hover) */}
              <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-500">
                <button
                  className="w-full bg-white/90 hover:bg-white text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 text-xs md:text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Ver categoría:', categoria.slug || categoria.nombre)
                  }}
                >
                  Ver Categoría en Tienda
                </button>

                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-105 text-xs md:text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSlugCategoria(categoria.slug || '')
                    setIsModalOpen(true)
                  }}
                >
                  Ver Catálogo
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sin categorías */}
        {categorias.length === 0 && (
          <div className="text-center text-white/80 py-12">
            <p className="text-lg">No hay categorías disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}

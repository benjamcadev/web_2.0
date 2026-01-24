import React, { useState } from 'react'
import Queue from './Header/Queue'
import { Yellowtail } from 'next/font/google'
import Image from 'next/image'

const yellowtail = Yellowtail({
  weight: ['400'],
  subsets: ['latin'],
})

interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  direccion_maps: string;
  ciudad: string;
  imagen: Imagen;
}

interface Imagen {
  url: string;
}

interface Nosotros {
  titulo: string;
  texto: string;
  video_fondo: VideoProps;
}

interface VideoProps {
  url: string;
}



export default function Nosotros({ sucursales, nosotros }: { sucursales: Sucursal[], nosotros: Nosotros[] }) {

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  return (
    <div className="flex flex-col md:items-center md:flex-row mt-6 gap-3 2xl:gap-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 ml-3 mr-3">

      {/* Contenedor Glass con video */}
      <div className="relative rounded-2xl border w-full border-white/30 overflow-hidden shadow-lg">
        {/* Video dentro del Glass */}

        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={`${STRAPI_URL}${nosotros[0].video_fondo.url}` || ''}
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Capa de oscurecimiento opcional */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xs" />

        {/* Contenido del Glass */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 text-white">

          {/* Texto principal */}
          <div className="md:w-2/5 mb-6 md:mb-0">
            <h2 className={`${yellowtail.className} text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-6`}>
              {nosotros[0].titulo}
            </h2>
            <p className="text-lg leading-relaxed p-2" style={{ whiteSpace: 'pre-line' }}>
              {nosotros[0].texto}
            </p>

          </div>

          {/* Tarjetas de sucursales */}
          <div className="md:w-3/5 grid grid-cols-1 md:grid-cols-2 gap-6 lg:pl-20 ">

            {sucursales.map((sucursal, index) => (
              <div key={index} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl overflow-hidden shadow-lg flex flex-col hover:scale-[1.02] transition-transform duration-300">
                <div className="relative  h-40 w-full">
                  <Image
                    src={`${STRAPI_URL}${sucursal.imagen?.url}` || ''}
                    alt={sucursal.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <iframe
                    className="w-full h-52"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={sucursal.direccion_maps}
                  />

                </div>
                <div className="p-4 text-center text-white space-y-3">
                  <h3 className="text-xl font-semibold">{sucursal.ciudad}</h3>
                  <p>{sucursal.direccion}</p>

                  {/* Botón ZeroQ solo La Serena */}
                  {sucursal.nombre === "La Serena Casa Matriz" ? (
                    <button
                      onClick={() => setIsQueueOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-2 text-sm font-semibold text-black hover:bg-white transition shadow-lg"
                    >
                      🎫 Obtener turno
                    </button>
                  ) : (
                    <div className="h-[40px]" />
                  )}
                </div>
              </div>

            ))}

          </div>
        </div>
      </div>
      {/* Modal de Fila */}
      <Queue isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
    </div>
  )
}

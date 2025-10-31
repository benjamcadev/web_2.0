'use client'
import React, { useState } from 'react'
import Temporada from './Temporada'
import Ofertas from './Ofertas';
import Biodegradables from './Biodegradables';

export default function SeccionProductos() {

  const [color, setColor] = useState<string>('');

  return (
     <div className="flex flex-col md:items-center md:flex-row  mt-6 px-6 gap-3 2xl:gap-6 rounded-2xl bg-white ml-3 mr-3">
          {/* Producto temporada  */}
          <div className={`w-full mt-4  md:w-5/12  rounded-2xl md:mt-6 md:mb-6  shadow-md p-4`}
           style={{ backgroundColor: color || '#1D4ED8' }}>
            <Temporada setColor={setColor}/>
          </div>
    
          {/* Prodcutos en oferta  */}
          <div className="w-full mb-4 md:w-4/12  bg-blue-800 rounded-2xl md:mt-6 md:mb-6 shadow-md p-4">
            <Ofertas />
          </div>

           {/* Prodcutos biodegradables  */}
          <div className="w-full mb-4 md:w-3/12 bg-green-600 rounded-2xl md:mt-6 md:mb-6 shadow-md p-4">
            <Biodegradables />
          </div>
    </div>
  )
}

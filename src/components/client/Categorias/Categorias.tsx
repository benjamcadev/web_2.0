'use client'
import React from 'react'

interface Categorias {
    id: number,
    nombre: string,

}

export default function Categorias({categorias}: {categorias : Categorias[]}) {

    console.log(categorias)
  return (
<div className="relative flex flex-col md:items-center md:flex-row mt-6 px-6 gap-6 rounded-2xl ml-3 mr-3 overflow-hidden text-white shadow-lg">
 
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-yellow-400 animate-gradient-move bg-[length:400%_400%] rounded-2xl"></div>
  
  
  <div className="relative z-10">
    {}
  </div>
</div>



  )
}

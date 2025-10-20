'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import { Product } from '@/types/chat';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);


  const imageUrl = product.images?.[0]?.url || '/placeholder-product.png';

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsClosing(true);
    setTimeout(() => setIsClosing(false), 300); // coincide con la duración de la animación
  };

  return (
    <>
      {/* TARJETA PRODUCTO */}
      <div className="bg-white rounded-2xl shadow-md p-4 m-4 flex flex-col items-center hover:shadow-lg transition">
        {/* Imagen */}
        <div className="w-28 h-28 relative">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain rounded-lg"
          />
        </div>

        {/* Nombre */}
        <h3 className="mt-2 text-sm text-shadow-2xs font-semibold text-gray-800 text-center">
          {product.name}
        </h3>

        {/* Precio */}
        <p className="mt-2 text-sm font-bold text-blue-600">
          {product.price ? '$' + product.price.toLocaleString('es-CL') : 'Sin precio'}
        </p>

        {/* Botón Ver Producto */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-3 text-xs font-light text-white bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-800 transition"
        >
          Ver producto
        </button>
      </div>

      {/* MODAL CON DETALLES */}
      {(isModalOpen || isClosing) && (
        <div
          className={`fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4`}
        >
          <div
            className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isModalOpen ? 'animate-fadeIn' : 'animate-fadeOut'
              }`}
          >
            {/* Header */}
            <div className="sticky top-0 z-100 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Cerrar modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4 flex flex-wrap  gap-4">
              {isZoomed && (

                <div
                  className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-120 cursor-zoom-out"
                  onClick={() => setIsZoomed(false)}
                >
                  <div className=' sticky top-0 w-full bg-white border-b border-gray-200 p-6 flex justify-end'>
                    <XMarkIcon className="w-6 h-6" onClick={() => setIsZoomed(false)} />
                  </div>
                  <div className="relative w-full max-w-3xl h-full max-h-[90vh]">
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

              )}
              {/* Imagen */}
              {product.images && product.images.length > 0 ? (
                <div className="relative  h-64 flex-shrink-0 w-full sm:w-64"
                  onClick={() => setIsZoomed(true)}
                >
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                  <MagnifyingGlassPlusIcon className='w-6 h-6 relative' />
                </div>

              ) : (
                <div className="bg-gray-200 h-64 w-64 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-400">Sin imagen disponible</span>
                </div>
              )}

              {/* Info principal */}
              <div className="flex-1 p-4 space-y-3">
                {/* Stock */}
                <div>
                  <span className="text-sm font-semibold text-gray-600">Stock disponible:</span>
                  <p
                    className={`text-lg font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {product.stock > 0 ? `${product.stock} unidades` : 'Sin disponibilidad'}
                  </p>
                </div>

                {/* Precio */}
                {product.price && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Precio:</span>
                    <p className="text-2xl font-bold text-blue-600">
                      ${product.price.toLocaleString('es-CL')}
                    </p>
                  </div>
                )}

                {/* Descripción */}
                {product.description && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">Descripción:</span>
                    <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                  </div>
                )}

                {/* Información Adicional */}
                {product.additional_information && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">
                      Información Adicional:
                    </span>
                    <p className="text-gray-700">{product.additional_information}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4 m-6">

              <button
                className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-colors ${product.stock > 0
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
                  }`}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Agregar al carrito o Cotizar' : 'Sin stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

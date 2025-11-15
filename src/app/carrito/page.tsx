"use client";

import { useCart } from "@/hooks/useCart";
import { formatCLP } from "@/lib/formatCLP";
import Image from "next/image";
import Link from "next/link";
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import Header from "@/components/client/Header/Header";
import { useEffect } from "react";
import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});


export default function CarritoPage() {
  // Obtener las FUNCIONES (no los valores directos)
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart();

  // Llamar a las funciones para obtener los valores
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  useEffect(() => {
    document.title = "Nuevo título dinámico";
  }, []);

  if (items.length === 0) {
    return (
      <>
      
        <Header />
        <div className={`${manrope.className} min-h-screen flex flex-col items-center justify-center px-4`}>
          <ShoppingBagIcon className="h-24 w-24 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-6">¡Agrega productos para comenzar tu compra!</p>
          <Link
            href="/tienda"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Ir a la tienda
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
    
      <Header />
  
      <main className={`${manrope.className} min-h-screen rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 ml-3 mr-3 py-8 px-4`}>
      
        <div className="max-w-6xl mx-auto">
          {/* Header del carrito */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
              <p className="text-gray-600 mt-1">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
            </div>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 transition-colors"
            >
              <TrashIcon className="h-5 w-5" />
              Vaciar carrito
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Imagen */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                      <Image
                        src={process.env.NEXT_PUBLIC_STRAPI_URL + item.images[0].url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      {item.oferta && (
                        <div className="absolute top-0 left-0 bg-red-600 text-white text-xs px-2 py-1 rounded-br-lg font-bold">
                          OFERTA
                        </div>
                      )}
                    </div>

                    {/* Información */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/tienda/${item.slug}`}>
                          <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-blue-600 font-bold mt-1">
                          {formatCLP(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Controles de cantidad */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="font-bold text-gray-900 w-8 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                            className="relative w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-white text-lg
             backdrop-blur-xl bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-300/50
             border border-white/40 shadow-[inset_1px_1px_4px_rgba(255,255,255,0.3),0_2px_10px_rgba(0,0,0,0.15)]
             before:absolute before:inset-0 before:rounded-full before:bg-white/30 before:opacity-0 hover:before:opacity-20
             transition-all duration-300 hover:scale-105"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Subtotal y eliminar */}
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-gray-900">
                            {formatCLP(item.price * item.cantidad)}
                          </p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-lg sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del pedido</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCLP(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Envío</span>
                    <span className="font-medium">A calcular</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatCLP(totalPrice)}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 mb-3">
                  Proceder al pago
                </button>

                <Link
                  href="/tienda"
                  className="block text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  ← Seguir comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
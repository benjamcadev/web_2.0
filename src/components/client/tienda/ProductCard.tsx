"use client";

import Image from "next/image";
import { Manrope } from "next/font/google";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Producto } from "@/types/producto";
import { formatCLP } from "@/lib/formatCLP";
import toast from "react-hot-toast";
import SuccessToast from "@/components/UI/SuccessToast";
import ErrorToast from '@/components/UI/ErrorToast'
import ProductModal from "@/components/client/tienda/ProductModal";
import { pluralizeUnit } from '@/lib/pluralizeUnit'

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ProductCard({ producto }: { producto: Producto }) {
  const { addItem } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = async () => {
  const ventaMin = producto.venta_minima || 1;
  const unidad = pluralizeUnit(producto.unidad_venta, ventaMin);

  if (cantidad < ventaMin) {
      toast.custom(
    <ErrorToast subtitle={`La venta mínima es de ${ventaMin} ${unidad}`} title={'Error con cantidades'} />,
    {
      duration: 5000,
      position: "bottom-center",
      icon: null,
      style: { background: "transparent", boxShadow: "none", padding: 0 },
    }
  );
   
    return;
  }

  const respuesta = await addItem({
    id: producto.id,
    documentId: producto.documentId,
    name: producto.name,
    price: producto.price,
    images: producto.images,
    slug: producto.slug,
    cantidad,
    oferta: producto.oferta,
    venta_minima: producto.venta_minima,
    unidad_venta: producto.unidad_venta
  });


  if(!respuesta.success){
     toast.custom(
    <ErrorToast subtitle={respuesta.message || "Hubo un error al agregar producto"} title={'Error'} />,
    {
      duration: 2400,
      position: "bottom-center",
      icon: null,
      style: { background: "transparent", boxShadow: "none", padding: 0 },
    }
  );

  return;
  }

  setCantidad(ventaMin);

  toast.custom(
    <SuccessToast subtitle={producto.name} title={'Producto Agregado'} />,
    {
      duration: 2400,
      position: "bottom-center",
      icon: null,
      style: { background: "transparent", boxShadow: "none", padding: 0 },
    }
  );
};


  const incrementar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCantidad((c) => c + 1);
  };

  const decrementar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCantidad((c) => (c > 1 ? c - 1 : 1));
  };

  return (
    <>
      <div className={`${manrope.className} group relative border border-white/60 ${producto.oferta ? 'bg-amber-500/60' : 'bg-gray-50/60'} backdrop-blur-xl rounded-3xl p-4 shadow-lg hover:-translate-y-1 transition-all duration-300`}>
        {producto.oferta && (
          <div className="absolute top-8 left-4 z-20 rotate-[-6deg] bg-red-600 text-white px-2 md:px-5 py-2 rounded-lg text-xs md:text-md font-bold shadow-lg border-2 md:border-3 border-white drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
            ¡ OFERTA !
          </div>
        )}

        {/* Imagen del producto */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full"
        >
          <div className="relative w-full aspect-square overflow-hidden rounded-2xl">
            <Image
              src={process.env.NEXT_PUBLIC_STRAPI_URL + producto.images[0].url}
              alt={producto.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </button>

        {/* Contenido */}
        <div className="pt-4 text-gray-900">
          <h2 className="text-lg font-semibold line-clamp-1">{producto.name}</h2>
          <p className="mt-1 text-lg font-bold text-blue-600 drop-shadow-sm">
            {formatCLP(producto.price)}
          </p>

          {/* Selector de cantidad */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              onClick={decrementar}
              className="relative w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white text-lg backdrop-blur-xl bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-300/50 border border-white/40 shadow-[inset_1px_1px_4px_rgba(255,255,255,0.3),0_2px_10px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-full before:bg-white/30 before:opacity-0 hover:before:opacity-20 transition-all duration-300 hover:scale-105"
            >
              −
            </button>
            <span className="text-lg bg-gray-100 rounded-2xl px-4 py-1 font-bold text-center min-w-[3rem]">
              {cantidad}
            </span>
            <button
              onClick={incrementar}
              className="relative w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-white text-lg backdrop-blur-xl bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-300/50 border border-white/40 shadow-[inset_1px_1px_4px_rgba(255,255,255,0.3),0_2px_10px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-full before:bg-white/30 before:opacity-0 hover:before:opacity-20 transition-all duration-300 hover:scale-105"
            >
              +
            </button>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="w-full text-white font-bold py-2 rounded-xl transition-colors bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-400/50 border border-white/40 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Agregar al carrito
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full text-center bg-white/50 backdrop-blur-sm border border-white/30 text-gray-800 py-2 rounded-xl hover:bg-white/70 transition-colors shadow-sm"
            >
              Ver detalles
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ProductModal 
        producto={producto}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
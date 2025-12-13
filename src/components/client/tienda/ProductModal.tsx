"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Manrope } from "next/font/google";
import { X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Producto } from "@/types/producto";
import { formatCLP } from "@/lib/formatCLP";
import toast from "react-hot-toast";
import SuccessToast from "@/components/UI/SuccessToast";
import ErrorToast from '@/components/UI/ErrorToast'
import { pluralizeUnit } from "@/lib/pluralizeUnit";




const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface ProductModalProps {
  producto: Producto;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ producto, isOpen, onClose }: ProductModalProps) {
  const { addItem } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [imagenActual, setImagenActual] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Asegurar que el componente está montado (solo en cliente)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset cantidad al abrir
  useEffect(() => {
    if (isOpen) setCantidad(1);
  }, [isOpen]);

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

  onClose();
};


  const incrementar = () => setCantidad((c) => c + 1);
  const decrementar = () => setCantidad((c) => (c > 1 ? c - 1 : 1));

  // No renderizar en el servidor
  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      className={`${manrope.className} fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200`}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-white/60 hover:bg-white transition-all duration-300 hover:scale-110"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Badge de oferta */}
        {producto.oferta && (
          <div className="absolute top-8 left-8 z-10 rotate-[-6deg] bg-red-600 text-white px-5 py-2 rounded-lg text-md font-bold shadow-lg border-3 border-white drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
            ¡ OFERTA !
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Columna izquierda - Imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-100/50">
              <Image
                src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${producto.images[imagenActual].url}`}
                alt={producto.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Miniaturas */}
            {producto.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {producto.images.map((imagen, index) => (
                  <button
                    key={index}
                    onClick={() => setImagenActual(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${imagenActual === index
                      ? "ring-4 ring-blue-500 scale-105"
                      : "ring-2 ring-gray-300 hover:ring-blue-300"
                      }`}
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${imagen.url}`}
                      alt={`${producto.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna derecha - Información */}
          <div className="flex flex-col">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {producto.name}
              </h1>

              <p className="text-3xl font-bold text-blue-600 drop-shadow-sm mb-6">
                {formatCLP(producto.price)}
              </p>

              {/* Descripción */}
              {producto.description || producto.additional_information && (
                <div className="mb-6">
                  {producto.description && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Descripción
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {producto.description}
                      </p>
                    </>

                  )}

                  {producto.additional_information && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Informacion Adicional
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {producto.additional_information}
                      </p>
                    </>

                  )}
                </div>
              )}

              {/* Información adicional */}
              <div className="bg-gray-50/60 backdrop-blur-sm border border-white/60 rounded-2xl p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Información del producto
                </h3>
                <div className="space-y-2 text-sm text-gray-700">

                  <div className="flex justify-between">
                    <span className="font-medium">Codigo:</span>
                    <span>{producto.internal_code == null || '' ? 'Sin Codigo' : producto.internal_code}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">SKU:</span>
                    <span>{producto.sku == null || '' ? 'Sin SKU' : producto.sku}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Categoría:</span>
                    <span>{producto.categoria == null || '' ? 'Sin Categoria' : producto.categoria}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Disponibilidad:</span>
                    <span className="text-green-600 font-semibold">En stock</span>
                  </div>
                </div>
              </div>

              {/* Venta minima */}
              {producto.venta_minima && producto.unidad_venta && (
                <div className=" bg-green-600/80  backdrop-blur-sm border border-white/60 rounded-2xl p-4 mb-6">
                  <span className="font-medium text-white">La venta minima del producto es: {producto.venta_minima}  {pluralizeUnit(producto.unidad_venta, producto.venta_minima || 1)}</span>
                </div>
              )}

            </div>

            {/* Selector de cantidad y botón */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-gray-700 font-medium">Cantidad:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementar}
                    className="relative w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white text-lg backdrop-blur-xl bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-300/50 border border-white/40 shadow-[inset_1px_1px_4px_rgba(255,255,255,0.3),0_2px_10px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-full before:bg-white/30 before:opacity-0 hover:before:opacity-20 transition-all duration-300 hover:scale-105"
                  >
                    −
                  </button>
                  <span className="text-xl bg-gray-100 rounded-2xl px-6 py-2 font-bold text-center min-w-[4rem]">
                    {cantidad}
                  </span>
                  <button
                    onClick={incrementar}
                    className="relative w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white text-lg backdrop-blur-xl bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-300/50 border border-white/40 shadow-[inset_1px_1px_4px_rgba(255,255,255,0.3),0_2px_10px_rgba(0,0,0,0.15)] before:absolute before:inset-0 before:rounded-full before:bg-white/30 before:opacity-0 hover:before:opacity-20 transition-all duration-300 hover:scale-105"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="w-full text-white font-bold py-3 rounded-xl transition-colors bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-400/50 border border-white/40 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Usar portal para renderizar en el body
  return createPortal(modalContent, document.body);
}
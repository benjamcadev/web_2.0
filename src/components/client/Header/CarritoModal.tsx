import React, { SetStateAction } from 'react'
import { Manrope } from "next/font/google";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/hooks/useCart";
import { formatCLP } from '@/lib/formatCLP'
import { useHydration } from "@/hooks/useHydration";
import Link from "next/link";
import SuccessToast from "@/components/UI/SuccessToast";
import ErrorToast from "@/components/UI/ErrorToast";
import toast from "react-hot-toast";

interface CarritoModalProps {
    isCartOpen: boolean;
    setIsCartOpen: React.Dispatch<SetStateAction<boolean>>;
}

const manrope = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export default function CarritoModal({ isCartOpen, setIsCartOpen }: CarritoModalProps) {

    const { items, getTotalPrice, removeItem } = useCart();

    // Evitar error de hidratación
    const isHydrated = useHydration();

    const totalPrice = isHydrated ? getTotalPrice() : 0;

    const handleRemoveItem = async (idItem : number) => {
        const response = await removeItem(idItem)

        if (response.success) {
            toast.custom(
                <SuccessToast subtitle={'Producto eliminado.'} title={`Listo !`} />,
                {
                    duration: 2400,
                    position: "bottom-center",
                    icon: null,
                    style: { background: "transparent", boxShadow: "none", padding: 0 },
                }
            );
        }else{
             toast.custom(
                    <ErrorToast subtitle={response.message || "Hubo un error desconocido al eliminar producto"} title={'Error'} />,
                    {
                        duration: 2400,
                        position: "bottom-center",
                        icon: null,
                        style: { background: "transparent", boxShadow: "none", padding: 0 },
                    }
                );
        }

       

    }

    return (
        <>
            {/* Modal del Carrito */}
            {isCartOpen && (
                <div
                    className={`${manrope.className} fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-[100]`}
                    onClick={() => setIsCartOpen(false)}
                >
                    <div
                        className="w-full max-w-sm h-full rounded-2xl bg-white/80 backdrop-blur-lg border border-white/30 shadow-xl p-6 flex flex-col animate-slide-left"
                        onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer click adentro
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Tu carrito</h2>

                            <button
                                className="p-1 rounded hover:bg-gray-200 transition"
                                onClick={() => setIsCartOpen(false)}
                            >
                                <XMarkIcon className="h-6 w-6 text-gray-700" />
                            </button>
                        </div>



                        {/* Items del carrito */}
                        <div className="flex-1 overflow-y-auto space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center space-x-3 border-b pb-3">
                                    <img
                                        src={process.env.NEXT_PUBLIC_STRAPI_URL + item.images[0].url}
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />

                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-sm text-gray-600">x{item.cantidad}</p>

                                        {/* Botón eliminar */}
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold 
             hover:bg-red-200 hover:text-red-800 transition-all shadow-sm"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className="w-4 h-4"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M6 7h12M9 7V4h6v3m-7 4v7m4-7v7m4-7v7M4 7h16"
                                                />
                                            </svg>
                                            Eliminar
                                        </button>

                                    </div>

                                    <span className="font-bold">{formatCLP(item.price * item.cantidad)}</span>
                                </div>
                            ))}

                        </div>

                        {/* Total del carrito */}
                        {items.length > 0 && (
                            <div className="mt-4 flex justify-between items-center text-lg font-bold border-t pt-4">
                                <span>Total:</span>
                                <span>{formatCLP(totalPrice)}</span>
                            </div>
                        )}

                        {/* Botón Ir al Carrito */}
                        <Link
                            href="/carrito"
                            className="w-full text-white font-bold py-2 rounded-xl transition-colors bg-gradient-to-br from-blue-800/80 via-blue-700/70 to-cyan-400/50
             border border-white/40 
             hover:shadow-lg hover:scale-105
             transition-all duration-300 text-center"
                            onClick={() => setIsCartOpen(false)}
                        >
                            Ir al carrito
                        </Link>
                    </div>
                </div>
            )}
        </>
    )
}

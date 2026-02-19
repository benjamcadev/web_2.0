"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/client/Header/Header";
import { useCart } from "@/hooks/useCart";
import { useEffect } from "react";

export default function PagoGiftcardSuccessPage() {
    const searchParams = useSearchParams();
    const pedidoId = searchParams.get("pedido");
    const { clearCartSuccess } = useCart();

    useEffect(() => {
       clearCartSuccess();
    },[])

    return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
                <div className="max-w-lg w-full bg-white/80 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-8 text-center">

                    {/* Icono */}
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="w-16 h-16 text-green-600" />
                    </div>

                    {/* Título */}
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                        ¡Compra realizada con éxito!
                    </h1>

                    {/* Subtítulo */}
                    <p className="text-gray-700 mb-6">
                        Tu pago fue realizado correctamente utilizando una{" "}
                        <span className="font-semibold text-green-700">Giftcard</span>.
                    </p>

                    {/* Pedido */}
                    {pedidoId && (
                        <div className="bg-green-100/70 border border-green-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-700">
                                Número de pedido
                            </p>
                            <p className="text-lg font-bold text-green-800 break-all">
                                {pedidoId}
                            </p>
                        </div>
                    )}

                    {/* Mensaje */}
                    <p className="text-sm text-gray-600 mb-8">
                        Hemos recibido tu pedido correctamente.
                        En breve recibirás un correo con el detalle de la compra.
                    </p>

                    {/* Acciones */}
                    <div className="space-y-3">
                        <Link
                            href="/tienda"
                            className="block w-full bg-gradient-to-br from-green-600 via-green-500 to-emerald-400 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            Seguir comprando
                        </Link>

                        <Link
                            href="/"
                            className="block text-center text-gray-600 hover:text-gray-800 text-sm"
                        >
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </>

    );
}
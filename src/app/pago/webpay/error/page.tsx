"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/client/Header/Header";
import { toast } from 'react-hot-toast';

export default function WebpayErrorPage() {
    const params = useSearchParams();
    const router = useRouter();
    const [info, setInfo] = useState({ title: "", message: "" });

    const encodedData = params.get("data");
    const data = encodedData ? JSON.parse(decodeURIComponent(encodedData)) : null;

   

    useEffect(() => {
        const tipo = params.get("tipo");

        switch (tipo) {
            case "cancelado":
                setInfo({
                    title: "Pago cancelado",
                    message:
                        "Has cancelado la transacción antes de finalizar el pago en Webpay.",
                });
                break;

            case "inconsistencia":
                setInfo({
                    title: "Inconsistencia detectada",
                    message:
                        "Webpay devolvió información contradictoria. La transacción no pudo continuar.",
                });
                break;

            case "sin_token":
                setInfo({
                    title: "Transacción incompleta",
                    message:
                        "Intenta nuevamente.",
                });
                break;

            case "fallo_confirmacion":
                setInfo({
                    title: "Error al confirmar el pago",
                    message:
                        `Webpay devolvió respuesta, pero no fue posible confirmar la transacción. Para mas detalles entregar esta información buy_order: ${data.webpay?.buy_order} , session_id: ${data.webpay?.session_id}`,
                });
                break;

            case "error_backend":
                setInfo({
                    title: "Error interno",
                    message:
                        "Ocurrió un error al procesar la transacción en nuestro servidor.",
                });
                break;

            case "desconocido":
            default:
                setInfo({
                    title: "Error desconocido",
                    message:
                        "Ha ocurrido un problema inesperado durante el proceso de pago.",
                });
                break;
        }
    }, [params]);

    return (
        <>
            <Header />
            <div className="flex flex-col md:items-center md:flex-row  mt-6 px-6 gap-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30  ml-3 mr-3">
                <div className="min-h-screen w-full flex items-center justify-center  px-4">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
                        <div className="text-center">
                            {/* ICONO DE ERROR */}
                            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <svg
                                    className="h-10 w-10 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3m0 4h.01M21.21 15.89A10 10 0 1112 2a10 10 0 019.21 13.89z"
                                    />
                                </svg>
                            </div>

                            {/* TITULO */}
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {info.title}
                            </h1>

                            {/* MENSAJE */}
                            <p className="text-gray-600 mb-6">{info.message}</p>

                            {/* BOTON VOLVER */}
                            <button
                                onClick={() => router.push("/carrito")}
                                className="w-full bg-gradient-to-br from-red-600 via-red-500 to-red-400 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"

                            >
                                Volver al carrito
                            </button>

                            {/* BOTON IR A LA TIENDA */}
                            <button
                                onClick={() => router.push("/tienda")}
                                className="w-full py-3 px-4 mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl hover:scale-105 transition-all duration-300"
                            >
                                Ir a la tienda
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>

    );
}

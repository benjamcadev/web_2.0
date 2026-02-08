"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/client/Header/Header";

export default function KhipuCancel() {
    const router = useRouter();
    const params = useSearchParams();
    const numeroPago = params.get("np");
    const calledRef = useRef(false);
    const [notificando, setNotificando] = useState(true);

    useEffect(() => {
        if (!numeroPago) {
            setNotificando(false);
            return;
        }

        if (calledRef.current) return;
        calledRef.current = true;

        const cancelarPago = async () => {
            try {
                await fetch(`/api/creditos/pagos/khipu/cancel?np=${numeroPago}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ "np": numeroPago }),
                });
            } catch (e) {
                console.error("Error notificando cancelación de pago:", e);
            } finally {
                setNotificando(false);
            }
        };

        cancelarPago();
    }, [numeroPago]);

    return (
        <>
            <Header />

            <div className="flex flex-col mt-6 px-6 gap-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 mx-3">
                <div className="min-h-screen w-full flex items-center justify-center px-4">
                    <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-200 text-center">

                        {/* ICONO */}
                        <div
                            className="mx-auto h-16 w-16 rounded-full bg-red-100
              flex items-center justify-center mb-4"
                        >
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
                            Pago cancelado
                        </h1>

                        {/* MENSAJE */}
                        <p className="text-gray-600 mb-6">
                            Cancelaste el proceso de pago en Khipu.
                            No se realizó ningún cargo ni transferencia.
                        </p>
                        {notificando && (
                            <p className="text-sm text-gray-500 mb-4">
                                Notificando cancelación del pago…
                            </p>
                        )}

                        {/* INFO */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-left mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                ¿Qué puedes hacer ahora?
                            </h2>

                            <ul className="list-disc ml-5 text-gray-700 space-y-1">
                                <li>Volver a intentar el pago cuando quieras</li>
                                <li>Cambiar el método de pago</li>
                                <li>Seguir comprando en la tienda</li>
                            </ul>
                        </div>

                        {/* BOTONES */}
                        <button
                            onClick={() => router.push("/tienda")}
                            className="w-full bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400
              text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105
              transition-all duration-300"
                        >
                            Volver a la tienda
                        </button>

                        <button
                            onClick={() => router.push("/")}
                            className="w-full py-3 px-4 mt-3 bg-gray-200 hover:bg-gray-300
              text-gray-800 font-semibold rounded-xl hover:scale-105
              transition-all duration-300"
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
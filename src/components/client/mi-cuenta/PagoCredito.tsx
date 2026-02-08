"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from "@/stores/useAuthStore";
import {
    XMarkIcon,
    CreditCardIcon,
    BanknotesIcon,
    CheckCircleIcon,
    LockClosedIcon,
    CalculatorIcon
} from "@heroicons/react/24/outline";
import { getSessionId } from '@/lib/stockReservationService';
import toast from "react-hot-toast";
import ErrorToast from '@/components/UI/ErrorToast'
import LoadingToast from '@/components/UI/LoadingToast';

// Asegúrate de que CreditoData tenga el campo 'estado'
interface CreditoData {
    id: number;
    documentId: string;
    numero_credito: number;
    saldo_pendiente: number;
    fecha_vencimiento: string;
    estado: string; // Necesario para saber si bloqueamos el input
}

interface PagoCreditoProps {
    credito: CreditoData;
    onCancel: () => void;
    onSuccess: () => void;
}

export default function PagoCredito({ credito, onCancel, onSuccess }: PagoCreditoProps) {
    const [metodoPago, setMetodoPago] = useState<"webpay" | "khipu" | null>(null);
    const [loading, setLoading] = useState(false);
    const [montoPagar, setMontoPagar] = useState<number>(credito.saldo_pendiente);

    const cliente = useAuthStore((s) => s.cliente);


    // Verificamos si está vencido para bloquear la edición
    const esVencido = credito.estado === 'vencido';

    // Formateador
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
    };

    // Manejador del Input de Monto
    const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Si el usuario borra todo, dejamos el estado en 0 (que visualmente será vacío)
        if (inputValue === "") {
            setMontoPagar(0);
            return;
        }

        // Convertimos a entero. Esto elimina automáticamente el "0" a la izquierda.
        // Ej: parseInt("06000") devuelve 6000
        const val = parseInt(inputValue, 10);

        // Validaciones de seguridad
        if (isNaN(val) || val < 0) return;

        if (val > credito.saldo_pendiente) {
            setMontoPagar(credito.saldo_pendiente);
        } else {
            setMontoPagar(val);
        }
    };
    const handleProcesarPago = async () => {
        if (!metodoPago || !cliente?.rut) return;
        if (montoPagar <= 0) return; // Seguridad extra

        const loadingToastId = toast.custom(
            <LoadingToast
                title="Validando datos..."
                subtitle="Por favor espera un momento."
            />,
            {
                duration: Infinity,
                position: "bottom-center",
                icon: null,
                style: { background: "transparent", boxShadow: "none", padding: 0 },
            }
        );

        setLoading(true);

        //obtener sesion
        const sessionId = getSessionId();

        try {

            if (metodoPago === "webpay") {
                const body = {
                    amount: montoPagar,
                    buyOrder: `CREDITO-${Date.now()}`,
                    sessionId: sessionId,
                    creditoDocumentId: credito.documentId,
                    cliente,
                    metodoPago
                };



                const res = await fetch("/api/creditos/pagos/webpay/init", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });



                const data = await res.json();

                if (!data.ok) {
                    toast.custom(
                        <ErrorToast
                            title="Error al iniciar pago con WebPay"
                            subtitle="Ocurrió un problema al iniciar el pago."
                        />,
                        {
                            duration: 6000,
                            position: "bottom-center",
                            icon: null,
                            style: { background: "transparent", boxShadow: "none", padding: 0 },
                        }
                    );
                    toast.dismiss(loadingToastId);
                    return;
                }

                toast.dismiss(loadingToastId);

                const loadingToastWebPay = toast.custom(
                    <LoadingToast
                        title="Redirigiendo a Webpay..."
                        subtitle="Por favor espera un momento."
                    />,
                    {
                        duration: Infinity,
                        position: "bottom-center",
                        icon: null,
                        style: { background: "transparent", boxShadow: "none", padding: 0 },
                    }
                );
                // Redirigir al usuario al formulario de pago de Webpay

                setTimeout(() => {
                    toast.dismiss(loadingToastWebPay);
                    window.location.href = `${data.url}?token_ws=${data.token}`;
                }, 2500);

            }

            if (metodoPago === "khipu") {

                const res = await fetch("/api/creditos/pagos/khipu/init", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: montoPagar,
                        cliente,
                        transactionId: `CREDITO-${Date.now()}`,
                        creditoDocumentId: credito.documentId,
                        sessionId,
                        metodoPago
                    })
                });

                const data = await res.json();

                if (!data.ok) {
                    toast.custom(
                        <ErrorToast
                            title='Error'
                            subtitle={'Error al iniciar pago con Khipu.'}
                        />,
                        {
                            duration: 6000,
                            position: "bottom-center",
                            icon: null,
                            style: { background: "transparent", boxShadow: "none", padding: 0 },
                        }
                    );
                    return;
                }
                const loadingToastKhipu = toast.custom(
                    <LoadingToast
                        title="Redirigiendo a Khipu..."
                        subtitle="Por favor espera un momento."
                    />,
                    {
                        duration: Infinity,
                        position: "bottom-center",
                        icon: null,
                        style: { background: "transparent", boxShadow: "none", padding: 0 },
                    }
                );
                // Redirigir al usuario al formulario de pago de Webpay

                setTimeout(() => {
                    toast.dismiss(loadingToastKhipu);
                    // Redirigir al checkout khipu
                    window.location.href = data.payment.payment_url + "?redirect-after=" + data.return_url + "?payment_id=" + data.payment.payment_id;
                }, 2500);

            }



        } catch (error) {
            console.error(error);
            alert("Error de conexión al procesar el pago");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8 animate-fade-in-up">
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-2xl shadow-purple-900/10 p-8">

                {/* Botón Cerrar */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 text-gray-500 hover:text-red-500 transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* COLUMNA 1: Definición del Monto (Abono o Total) */}
                    <div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">
                            Pagar Crédito <span className="text-purple-600">#{credito.numero_credito}</span>
                        </h4>

                        {/* Mensaje condicional según estado */}
                        {esVencido ? (
                            <p className="text-sm text-red-500 font-medium mb-6 flex items-center bg-red-50 p-2 rounded-lg border border-red-100">
                                <LockClosedIcon className="w-4 h-4 mr-2" />
                                Crédito vencido: Debes pagar el monto total.
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 mb-6">
                                Puedes pagar el total o realizar un abono parcial.
                            </p>
                        )}

                        <div className="bg-white/60 rounded-2xl p-6 border border-white/80 shadow-sm space-y-4">

                            {/* Información Saldo Actual */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Deuda Total:</span>
                                <span className="font-medium text-gray-700">
                                    {formatCurrency(credito.saldo_pendiente)}
                                </span>
                            </div>

                            <div className="border-t border-gray-200/50"></div>

                            {/* INPUT DE MONTO A PAGAR */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1 ml-1">
                                    Monto a Pagar
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        // --- CAMBIO AQUÍ ---
                                        // Si el monto es 0, mostramos string vacío para que el placeholder o nada se vea
                                        value={montoPagar === 0 ? "" : montoPagar}
                                        onChange={handleMontoChange}
                                        disabled={esVencido}
                                        placeholder={credito.saldo_pendiente.toString()} // Opcional: muestra el total como sugerencia fantasma
                                        className={`w-full pl-8 pr-4 py-3 rounded-xl border font-bold text-lg outline-none transition-all
                                            ${esVencido
                                                ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-white border-purple-200 text-purple-900 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                                            }
                                        `}
                                    />

                                </div>
                            </div>

                            {/* Proyección de Saldo (Solo visual) */}
                            {!esVencido && (
                                <div className="bg-purple-50/50 rounded-lg p-3 flex justify-between items-center text-xs text-purple-800">
                                    <span className="flex items-center">
                                        <CalculatorIcon className="w-3 h-3 mr-1" />
                                        Nuevo saldo estimado:
                                    </span>
                                    <span className="font-bold">
                                        {formatCurrency(credito.saldo_pendiente - montoPagar)}
                                    </span>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* COLUMNA 2: Selección de Método (Casi igual, solo cambiamos el total mostrado) */}
                    <div className="flex flex-col justify-center space-y-4">
                        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
                            Elige medio de pago
                        </p>

                        {/* Webpay */}
                        <button
                            onClick={() => setMetodoPago("webpay")}
                            className={`group relative flex items-center p-4 rounded-xl border transition-all duration-300
                                ${metodoPago === "webpay"
                                    ? "bg-blue-50/80 border-blue-500 shadow-md ring-1 ring-blue-500"
                                    : "bg-white/40 border-white/60 hover:bg-white/70"
                                }`}
                        >
                            <div className={`p-3 w-14 h-14 flex items-center justify-center rounded-full mr-4 ${metodoPago === "webpay" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                                <img
                                    src="/img/webpay.png"
                                    alt="Webpay"
                                    className="w-15 h-15 object-contain"
                                />
                            </div>
                            <div className="text-left flex-1">
                                <span className={`block font-bold ${metodoPago === "webpay" ? "text-blue-700" : "text-gray-700"}`}>Webpay Plus</span>
                                <span className="text-xs text-gray-500">Tarjetas de crédito y débito</span>
                            </div>
                            {metodoPago === "webpay" && <CheckCircleIcon className="w-6 h-6 text-blue-500" />}
                        </button>

                        {/* Khipu */}
                        <button
                            onClick={() => setMetodoPago("khipu")}
                            className={`group relative flex items-center p-4 rounded-xl border transition-all duration-300
                                ${metodoPago === "khipu"
                                    ? "bg-emerald-50/80 border-emerald-500 shadow-md ring-1 ring-emerald-500"
                                    : "bg-white/40 border-white/60 hover:bg-white/70"
                                }`}
                        >
                            <div className={`p-3 w-14 h-14 flex items-center justify-center rounded-full mr-4 ${metodoPago === "khipu" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                                <img
                                    src="/img/khipu.jpg"
                                    alt="Khipu"
                                    className="w-15 h-15 object-contain"
                                />
                            </div>
                            <div className="text-left flex-1">
                                <span className={`block font-bold ${metodoPago === "khipu" ? "text-emerald-700" : "text-gray-700"}`}>Transferencia</span>
                                <span className="text-xs text-gray-500">Khipu (Bancos nacionales)</span>
                            </div>
                            {metodoPago === "khipu" && <CheckCircleIcon className="w-6 h-6 text-emerald-500" />}
                        </button>

                        {/* Botón de Acción Final */}
                        <button
                            disabled={!metodoPago || loading || montoPagar <= 0}
                            onClick={handleProcesarPago}
                            className={`mt-4 w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-300
                                ${!metodoPago || loading || montoPagar <= 0
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-gradient-to-r from-gray-900 to-gray-700 hover:scale-[1.02] hover:shadow-xl"
                                }
                            `}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </span>
                            ) : (
                                // Mostramos el monto dinámico en el botón
                                `Pagar ${formatCurrency(montoPagar)}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
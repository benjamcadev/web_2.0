"use client";

import React, { useEffect, useState, useRef } from 'react';
import PagoCredito from '@/components/client/mi-cuenta/PagoCredito'
import { formatCLP } from '@/lib/formatCLP'
import { useAuthStore } from "@/stores/useAuthStore";
import {
    CalendarIcon,
    DocumentTextIcon,
    BanknotesIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CreditCardIcon,
    ChevronLeftIcon,   // Icono nuevo
    ChevronRightIcon   // Icono nuevo
} from "@heroicons/react/24/outline";

interface CreditoData {
    id: number;
    documentId: string;
    numero_credito: number;
    monto: number;
    saldo_pendiente: number;
    estado: "pendiente" | "pagado" | "vencido";
    fecha_emision: string;
    fecha_vencimiento: string;
    dias_credito: number;
    pedido?: {
        numero_pedido: number;
        total: number;
    };
}

export default function Credito() {
    const [creditos, setCreditos] = useState<CreditoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCredit, setSelectedCredit] = useState<CreditoData | null>(null);

    // --- ESTADOS PARA PAGINACIÓN ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [credito, setCredito] = useState(false)
    const [cupoTotal, setCupoTotal] = useState(0)
    const [cupoUtilizado, setCupoUtilizado] = useState(0)
    const [cupoDisponible, setCupoDisponible] = useState(0)
    const itemsPerPage = 5; // Cantidad de filas por página

    const pagoSectionRef = useRef<HTMLDivElement>(null);
    const cliente = useAuthStore((s) => s.cliente);


    useEffect(() => {
        if (!cliente) return
        setCredito(cliente.credito_habilitado)
        setCupoTotal(cliente.cupo_total)
        setCupoUtilizado(cliente.cupo_utilizado)
        setCupoDisponible(cliente.cupo_disponible)

    }, [cliente])

    const porcentajeUso = cupoTotal > 0
        ? Math.min(100, Math.round((cupoUtilizado / cupoTotal) * 100))
        : 0

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
        }).format(amount);
    };

    // --- CÁLCULO 1: PLAZO TOTAL (Estático) ---
    const getCreditTerm = (fechaEmision: string, fechaVencimiento: string) => {
        const emision = new Date(fechaEmision);
        const vencimiento = new Date(fechaVencimiento);
        emision.setHours(0, 0, 0, 0);
        vencimiento.setHours(0, 0, 0, 0);

        const diffTime = vencimiento.getTime() - emision.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // --- CÁLCULO 2: DÍAS RESTANTES DESDE HOY (Dinámico) ---
    const getDaysFromToday = (fechaVencimiento: string) => {
        const hoy = new Date();
        const vencimiento = new Date(fechaVencimiento);

        hoy.setHours(0, 0, 0, 0);
        vencimiento.setHours(0, 0, 0, 0);

        const diffTime = vencimiento.getTime() - hoy.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // --- LÓGICA DE ESTADOS Y COLORES ---
    const getStatusInfo = (credito: CreditoData) => {
        if (credito.estado === 'pagado') {
            return {
                style: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
                label: "Pagado",
                textClass: "text-gray-600",
                icon: null
            };
        }

        const daysLeft = getDaysFromToday(credito.fecha_vencimiento);

        if (credito.estado === 'vencido' || daysLeft < 0) {
            return {
                style: "bg-red-500/10 text-red-700 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.25)] font-bold",
                label: "Vencido",
                textClass: "text-red-600 font-semibold",
                icon: <ExclamationTriangleIcon className="w-4 h-4 mr-1 inline" />
            };
        }

        if (daysLeft >= 0 && daysLeft <= 5) {
            return {
                style: "bg-amber-500/10 text-amber-700 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold",
                label: daysLeft === 0 ? "Vence Hoy" : "Por Vencer",
                textClass: "text-amber-600 font-semibold",
                icon: <ClockIcon className="w-4 h-4 mr-1 inline" />
            };
        }

        return {
            style: "bg-blue-500/10 text-blue-700 border-blue-500/20",
            label: "Vigente",
            textClass: "text-gray-600",
            icon: null
        };
    };

    const handlePagarCredito = (credito: CreditoData) => {
        if (selectedCredit?.id === credito.id) {
            setSelectedCredit(null);
        } else {
            setSelectedCredit(credito);
            setTimeout(() => {
                pagoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    // --- FETCH DATA CON PAGINACIÓN ---
    useEffect(() => {
        const fetchCreditos = async () => {
            if (!cliente?.rut) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                // Enviamos RUT, PAGE y PAGE_SIZE
                const res = await fetch(
                    `/api/creditos/listar?rut=${cliente.rut}&page=${currentPage}&pageSize=${itemsPerPage}`
                );
                const data = await res.json();

                if (data.success) {
                    setCreditos(data.creditos);

                    // Actualizamos la meta-información desde el backend
                    if (data.meta && data.meta.pagination) {
                        setTotalPages(data.meta.pagination.pageCount);
                        setTotalItems(data.meta.pagination.total);
                    }
                } else {
                    setError(data.message || "No se pudieron cargar los créditos.");
                }
            } catch (err) {
                console.error(err);
                setError("Error de conexión.");
            } finally {
                setLoading(false);
            }
        };

        fetchCreditos();
    }, [cliente, currentPage]); // Se vuelve a ejecutar cuando cambia la página

    // --- MANEJADORES DE CAMBIO DE PÁGINA ---
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    if (loading && creditos.length === 0) { // Mostrar loading solo si no hay datos previos o es carga inicial
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center rounded-2xl bg-white/40 backdrop-blur-md border border-white/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                <span className="text-sm text-purple-800 font-medium">Cargando créditos...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 rounded-2xl bg-red-50/50 backdrop-blur-md border border-red-100 text-red-600">
                ⚠️ {error}
            </div>
        );
    }

    return (
        <div className="relative w-full pb-10">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 px-1">
                <div>
                    <h3 className="text-2xl font-bold bg-clip-text text-black">
                        Historial de Créditos
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Gestiona tus cupos y revisa tus vencimientos.
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold bg-white/50 border border-white/60 shadow-sm text-gray-600 backdrop-blur-sm">
                        <DocumentTextIcon className="w-4 h-4 mr-2 text-purple-500" />
                        Total: {totalItems} registros
                    </span>
                </div>
            </div>

            {/* Crédito */}
            <div className="rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 p-5 space-y-4 mb-6">

                {credito ? (
                    <>
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Crédito disponible</h4>
                            <span className="text-xs text-gray-600">
                                {porcentajeUso}% utilizado
                            </span>
                        </div>

                        {/* Barra de progreso */}
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500
                                    ${porcentajeUso < 70
                                        ? 'bg-green-500'
                                        : porcentajeUso < 90
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                    }`}
                                style={{ width: `${porcentajeUso}%` }}
                            />
                        </div>

                        {/* Detalle montos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2">
                            <CreditBox label="Cupo total" value={formatCLP(cupoTotal)} />
                            <CreditBox label="Utilizado" value={formatCLP(cupoUtilizado)} />
                            <CreditBox label="Disponible" value={formatCLP(cupoDisponible)} highlight />
                        </div>
                    </>
                ) : (
                    <h3 className="font-semibold text-gray-600">
                        No existe crédito disponible
                    </h3>
                )}
            </div>

            {/* Tabla */}
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-2xl shadow-purple-900/5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

                {creditos.length === 0 && !loading ? (
                    <div className="relative z-10 flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-4 rounded-full bg-gray-50/50 mb-3">
                            <BanknotesIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No tienes créditos registrados aún.</p>
                    </div>
                ) : (
                    <>
                        <div className={`relative z-10 overflow-x-auto transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200/50 text-xs uppercase tracking-wider text-gray-500">
                                        <th className="px-6 py-5 font-semibold bg-gray-50/30">N° Crédito</th>
                                        <th className="px-6 py-5 font-semibold bg-gray-50/30">Pedido</th>
                                        <th className="px-6 py-5 font-semibold bg-gray-50/30">Emisión</th>
                                        <th className="px-6 py-5 font-semibold bg-gray-50/30">Vencimiento</th>
                                        <th className="px-6 py-5 font-semibold bg-gray-50/30 text-right">Monto</th>
                                        <th className="px-6 py-5 font-semibold bg-gray-50/30 text-right">Pendiente</th>
                                        <th className="px-6 py-5 font-semibold bg-gray-50/30 text-center">Estado</th>
                                        <th className="px-6 py-5 font-semibold bg-gray-50/30 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {creditos.map((credito) => {
                                        // Calculamos Estado
                                        const { style, label, textClass, icon } = getStatusInfo(credito);

                                        // Calculamos Plazo
                                        const plazoTotal = credito.dias_credito > 0
                                            ? credito.dias_credito
                                            : getCreditTerm(credito.fecha_emision, credito.fecha_vencimiento);

                                        const showPayButton = credito.estado !== 'pagado';
                                        const isSelected = selectedCredit?.id === credito.id;

                                        return (
                                            <tr
                                                key={credito.id}
                                                className="group border-b border-gray-100/40 hover:bg-white/50 transition-colors duration-300"
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    #{credito.numero_credito || credito.id}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center text-purple-700 font-medium bg-purple-50/50 px-2 py-1 rounded-lg border border-purple-100/50">
                                                        #{credito.pedido ? credito.pedido.numero_pedido : "—"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(credito.fecha_emision).toLocaleDateString("es-CL")}
                                                </td>
                                                <td className={`px-6 py-4 ${textClass}`}>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {new Date(credito.fecha_vencimiento).toLocaleDateString("es-CL")}
                                                            </span>
                                                            <span className="text-[10px] opacity-70">
                                                                Plazo: {plazoTotal} días
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-right text-gray-500 font-medium">
                                                    {formatCurrency(credito.monto)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`text-base font-bold tracking-tight ${credito.saldo_pendiente > 0 ? "text-gray-900" : "text-gray-300"}`}>
                                                        {formatCurrency(credito.saldo_pendiente)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md whitespace-nowrap ${style}`}>
                                                        {icon}
                                                        {label}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    {showPayButton ? (
                                                        <button
                                                            onClick={() => handlePagarCredito(credito)}
                                                            className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200
                                                                ${isSelected
                                                                    ? "bg-gray-800 text-white shadow-gray-500/20 scale-95"
                                                                    : "bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 text-white hover:scale-105"
                                                                }
                                                            `}
                                                        >
                                                            <CreditCardIcon className="w-3 h-3 mr-1.5" />
                                                            {isSelected ? "Seleccionado" : "Pagar"}
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* --- FOOTER DE PAGINACIÓN --- */}
                        <div className="relative z-10 px-6 py-4 border-t border-gray-200/50 flex flex-col sm:flex-row items-center justify-between bg-white/30 gap-4 sm:gap-0">
                            <div className="text-xs text-gray-500 font-medium order-2 sm:order-1">
                                Mostrando <span className="text-gray-800">{((currentPage - 1) * itemsPerPage) + 1}</span> a <span className="text-gray-800">{Math.min(currentPage * itemsPerPage, totalItems)}</span> de <span className="text-gray-800">{totalItems}</span> resultados
                            </div>

                            <div className="flex items-center space-x-2 order-1 sm:order-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1 || loading}
                                    className={`p-2 rounded-lg border transition-all duration-200 ${currentPage === 1 || loading
                                            ? "border-transparent text-gray-300 cursor-not-allowed"
                                            : "border-white/60 bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm"
                                        }`}
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>

                                <span className="text-xs font-semibold text-gray-600 bg-white/50 px-3 py-1 rounded-md border border-white/60">
                                    Página {currentPage} de {totalPages}
                                </span>

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages || loading}
                                    className={`p-2 rounded-lg border transition-all duration-200 ${currentPage === totalPages || loading
                                            ? "border-transparent text-gray-300 cursor-not-allowed"
                                            : "border-white/60 bg-white/50 text-gray-600 hover:bg-white hover:shadow-sm"
                                        }`}
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-4 text-center flex flex-wrap justify-center gap-4 text-[10px] uppercase tracking-widest text-gray-400">
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-400 mr-1"></span> Vencido (Pasó la fecha)</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-1"></span> Por Vencer (Quedan 5 días o menos)</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-1"></span> Pagado</span>
            </div>

            {selectedCredit && (
                <div ref={pagoSectionRef}>
                    <PagoCredito
                        credito={selectedCredit}
                        onCancel={() => setSelectedCredit(null)}
                        onSuccess={() => setSelectedCredit(null)}
                    />
                </div>
            )}
        </div>
    );
}


function CreditBox({
    label,
    value,
    highlight,
}: {
    label: string
    value: string
    highlight?: boolean
}) {
    return (
        <div
            className={`rounded-xl p-3 text-center
                ${highlight
                    ? 'bg-green-500/20 text-green-800'
                    : 'bg-white/50'}
            `}
        >
            <p className="text-xs">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
        </div>
    )
}
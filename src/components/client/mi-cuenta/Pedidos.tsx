import React, { useEffect, useState } from 'react'
import { useAuthStore } from "@/stores/useAuthStore";
// import Link from 'next/link'; // YA NO LO NECESITAMOS PARA EL DETALLE
import { ChevronLeftIcon, ChevronRightIcon, EyeIcon } from "@heroicons/react/24/outline";
import DetallePedidoModal from './DetallePedidoModal'; // IMPORTAR EL NUEVO COMPONENTE

// Configuración
const ITEMS_PER_PAGE = 5;

// --- FUNCIONES AUXILIARES ---
const formatearMoneda = (valor: number | string) => {
    if (!valor) return '$0';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(Number(valor));
};

const formatearFecha = (fecha: string) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
};

const EstadoBadge = ({ estado }: { estado: string }) => {
    let colorClass = "bg-gray-100 text-gray-800 border-gray-200";
    switch (estado) {
        case 'pendiente': colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200"; break;
        case 'preparacion': colorClass = "bg-orange-100 text-orange-800 border-orange-200"; break;
        case 'enviado': colorClass = "bg-blue-100 text-blue-800 border-blue-200"; break;
        case 'entregado': colorClass = "bg-green-100 text-green-800 border-green-200"; break;
        case 'cancelado': colorClass = "bg-red-100 text-red-800 border-red-200"; break;
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </span>
    );
};

export default function Pedidos() {
    const cliente = useAuthStore((s) => s.cliente);
    
    // Estados
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Paginación
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<any>(null);

    // ESTADO PARA EL MODAL
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        const fetchPedidos = async () => {
            if (!cliente?.documentId) return;

            try {
                setIsLoading(true);
                // populate=* es clave para traer items_pedidos y pagos para el modal
                const res = await fetch(`/api/mi-cuenta/get-pedidos?documentId=${cliente.documentId}&page=${page}&pageSize=${ITEMS_PER_PAGE}`);
                
                if (!res.ok) throw new Error('Error al cargar pedidos');
                
                const data = await res.json();
                setPedidos(data.pedidos || []);
                setMeta(data.meta?.pagination);
            } catch (err) {
                console.error(err);
                setError('No pudimos cargar tu historial de pedidos.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPedidos();
    }, [cliente?.documentId, page]);

    const handlePrev = () => { if (page > 1) setPage(p => p - 1); }
    const handleNext = () => { if (meta && page < meta.pageCount) setPage(p => p + 1); }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Mis Pedidos</h3>
                
                <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/30 overflow-hidden shadow-sm min-h-[200px] flex flex-col">
                    
                    {isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
                            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-sm font-medium">Cargando historial...</p>
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="flex-1 p-8 text-center text-red-500">
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()} className="mt-2 text-sm underline hover:text-red-700">Intentar nuevamente</button>
                        </div>
                    )}

                    {!isLoading && !error && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/60 text-gray-600 border-b border-white/20">
                                        <tr className="text-left">
                                            <th className="px-5 py-4 font-medium">N° Pedido</th>
                                            <th className="px-5 py-4 font-medium hidden sm:table-cell">Fecha</th>
                                            <th className="px-5 py-4 font-medium text-center">Estado</th>
                                            <th className="px-5 py-4 font-medium text-right">Total</th>
                                            <th className="px-5 py-4 font-medium text-center">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-white/20">
                                        {pedidos.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                                                    No tienes pedidos registrados.
                                                </td>
                                            </tr>
                                        ) : (
                                            pedidos.map((pedido: any) => (
                                                <tr key={pedido.numero_pedido} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                                                    <td className="px-5 py-4 text-gray-800 font-medium">
                                                        <span className="font-mono text-gray-500">#</span>{pedido.numero_pedido}
                                                        <div className="sm:hidden text-xs text-gray-400 mt-1">{formatearFecha(pedido.createdAt)}</div>
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-600 hidden sm:table-cell">{formatearFecha(pedido.createdAt)}</td>
                                                    <td className="px-5 py-4 text-center"><EstadoBadge estado={pedido.estado} /></td>
                                                    <td className="px-5 py-4 text-right text-gray-800 font-semibold">{formatearMoneda(pedido.total)}</td>
                                                    <td className="px-5 py-4 text-center">
                                                        {/* BOTÓN OJO: ABRE EL MODAL */}
                                                        <button 
                                                            onClick={() => setSelectedOrder(pedido)}
                                                            className="inline-flex p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                                                            title="Ver detalles"
                                                        >
                                                            <EyeIcon className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {meta && meta.pageCount > 1 && (
                                <div className="px-5 py-4 border-t border-white/20 bg-white/30 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Página {page} de {meta.pageCount}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handlePrev}
                                            disabled={page === 1}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 bg-white/50 hover:bg-white hover:shadow-sm'}`}
                                        >
                                           <ChevronLeftIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            disabled={page >= meta.pageCount}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${page >= meta.pageCount ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 bg-white/50 hover:bg-white hover:shadow-sm'}`}
                                        >
                                           <ChevronRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* RENDERIZADO DEL MODAL */}
            {selectedOrder && (
                <DetallePedidoModal 
                    pedido={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </div>
    )
}
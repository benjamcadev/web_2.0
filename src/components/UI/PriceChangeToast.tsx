import React from 'react';
import { toast } from 'react-hot-toast';
// Usamos CurrencyDollarIcon o ArrowTrendingUpIcon para que sea más temático de precios,
// pero puedes volver a ExclamationTriangleIcon si prefieres.
import { CurrencyDollarIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface PriceChangeToastProps {
    t: any;
    discrepancias: any[];
    onConfirm: () => void;
    onCancel?: () => void;
}

const formatearMoneda = (valor: number) => 
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor);

export default function PriceChangeToast({ t, discrepancias, onConfirm, onCancel }: PriceChangeToastProps) {
    
    const handleCancel = () => {
        if (onCancel) onCancel();
        toast.dismiss(t.id);
    };

    const handleConfirm = () => {
        onConfirm();
        toast.dismiss(t.id);
    };

    return (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full shadow-2xl rounded-2xl pointer-events-auto flex overflow-hidden ring-1 ring-black/5 
            // --- CAMBIOS CLAVE DE ESTILO ---
            bg-cyan-600/90 backdrop-blur-md border border-cyan-500/50
            `}
        >
            <div className="flex-1 w-0 p-6">
                <div className="flex items-start">
                    {/* Icono: Cambiado a blanco para contraste */}
                    <div className="flex-shrink-0 pt-0.5">
                        <CurrencyDollarIcon className="h-10 w-10 text-white" aria-hidden="true" />
                    </div>
                    
                    <div className="ml-4 flex-1">
                        {/* Header y Botón Cerrar */}
                        <div className="flex items-start justify-between">
                            <div>
                                {/* Textos en blanco/claros */}
                                <p className="text-sm font-bold text-white">
                                    Precios actualizados
                                </p>
                                <p className="mt-1 text-sm text-cyan-100">
                                    El valor de algunos productos ha cambiado. Revisa los nuevos totales.
                                </p>
                            </div>
                            <div className="ml-4 flex flex-shrink-0">
                                <button
                                    type="button"
                                    // Botón cerrar adaptado al fondo cian
                                    className="inline-flex rounded-md bg-transparent text-cyan-200 hover:text-white focus:outline-none"
                                    onClick={() => toast.dismiss(t.id)}
                                >
                                    <span className="sr-only">Cerrar</span>
                                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        {/* Lista de Discrepancias */}
                        <div className="mt-4 border-t border-white/20 divide-y divide-white/20 max-h-[180px] overflow-y-auto px-1">
                            {discrepancias.map((d, i) => (
                                <div key={i} className="py-3 flex justify-between items-center text-sm">
                                    {/* Nombre producto en blanco */}
                                    <span className="font-medium text-white pr-4 truncate">
                                        {d.nombre}
                                    </span>
                                    <div className="flex flex-col items-end flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            {/* Precio viejo tachado (cian claro) */}
                                            <span className="text-cyan-300/80 line-through text-xs">
                                                {formatearMoneda(d.precio_carrito)}
                                            </span>
                                            {/* Precio nuevo (blanco negrita) */}
                                            <span className="font-bold text-white">
                                                {formatearMoneda(d.precio_real)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botones de Acción */}
                        <div className="mt-5 flex gap-3">
                            {/* Botón Cancelar: Estilo "Ghost" blanco */}
                            <button
                                type="button"
                                className="inline-flex flex-1 justify-center rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 focus:outline-none transition-all active:scale-95"
                                onClick={handleCancel}
                            >
                                Cancelar compra
                            </button>
                            {/* Botón Actualizar: Blanco sólido para énfasis máximo o un cian muy oscuro */}
                            <button
                                type="button"
                                className="inline-flex flex-1 justify-center rounded-xl border border-transparent bg-white px-4 py-2.5 text-sm font-bold text-cyan-800 shadow-sm hover:bg-cyan-50 focus:outline-none transition-all active:scale-95"
                                onClick={handleConfirm}
                            >
                                Actualizar precios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
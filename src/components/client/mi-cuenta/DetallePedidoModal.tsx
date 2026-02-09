import React, { useEffect, useState } from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DetallePedidoModalProps {
    pedido: any;
    onClose: () => void;
}

// --- FUNCIONES AUXILIARES ---
const formatearMoneda = (valor: number | string) => {
    if (!valor) return '$0';
    return new Intl.NumberFormat('es-CL', { 
        style: 'currency', 
        currency: 'CLP', 
        minimumFractionDigits: 0 
    }).format(Number(valor));
};

const formatearFechaHora = (fecha: string) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

export default function DetallePedidoModal({ pedido, onClose }: DetallePedidoModalProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    // --- EFECTO DE ANIMACIÓN ---
    useEffect(() => {
        if (pedido) {
            setShouldRender(true);
            // Pequeño retardo para permitir que el DOM se monte antes de animar la opacidad
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            // Esperamos a que termine la animación de salida (300ms) para desmontar
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [pedido]);

    // Función para manejar el cierre con animación
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Debe coincidir con la duración de la transición CSS
    };

    if (!shouldRender && !pedido) return null;

    // --- LÓGICA DE DATOS ---
    const tipoDelivery = pedido?.tipo_delivery?.toLowerCase() || '';
    const esEnvio = tipoDelivery.includes('envio') || 
                    tipoDelivery.includes('despacho') || 
                    tipoDelivery.includes('domicilio');

    return (
        <div 
            className={`
                fixed inset-0 z-[60] flex items-center justify-center p-4 
                transition-all duration-300 ease-out
                ${isVisible ? 'visible' : 'invisible'}
            `}
        >
            
            {/* Backdrop (Fondo oscuro) */}
            <div 
                className={`
                    absolute inset-0 bg-black/20 rounded-2xl backdrop-blur-sm transition-opacity duration-300 ease-out
                    ${isVisible ? 'opacity-100' : 'opacity-0'}
                `}
                onClick={handleClose}
            />

            {/* Contenedor del Modal */}
            <div 
                className={`
                    relative w-full max-w-3xl bg-white/80 backdrop-blur-2xl border border-white/40 
                    rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]
                    transform transition-all duration-300 ease-out
                    ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
                `}
            >
                
                {/* --- HEADER --- */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50 bg-white/40">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            Detalle del Pedido #{pedido?.numero_pedido || pedido?.id}
                        </h3>
                        <p className="text-xs text-gray-500">
                            Realizado el {formatearFechaHora(pedido?.createdAt)}
                        </p>
                    </div>
                    <button 
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-gray-200/50 text-gray-500 transition-colors focus:outline-none"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* --- BODY (Scrollable) --- */}
                <div className="p-6 overflow-y-auto space-y-6">
                    
                    {/* SECCIÓN 1: Info General y Datos de Entrega */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Columna Izquierda: Datos del Pedido */}
                        <div className="space-y-4">
                            <div className="bg-white/50 p-4 rounded-xl border border-white/30 shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    Información General
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                        <span className="text-gray-500">Estado:</span>
                                        <span className={`font-medium capitalize px-2 py-0.5 rounded text-xs
                                            ${pedido?.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                                              pedido?.estado === 'entregado' ? 'bg-green-100 text-green-800' : 
                                              'bg-blue-100 text-blue-800'}`}>
                                            {pedido?.estado}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-gray-500">Sucursal origen:</span>
                                        <span className="font-medium text-gray-800 text-right">
                                            {pedido?.sucursal || 'Central'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Tipo de Entrega:</span>
                                        <span className="font-medium capitalize text-gray-800">
                                            {pedido?.tipo_delivery || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Logística */}
                        <div className="bg-white/50 p-4 rounded-xl border border-white/30 shadow-sm space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Logística</h4>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Fecha de Envío</p>
                                    <p className="font-medium text-gray-800">
                                        {formatearFechaHora(pedido?.fecha_envio)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Fecha de Entrega</p>
                                    <p className="font-medium text-gray-800">
                                        {formatearFechaHora(pedido?.fecha_entrega)}
                                    </p>
                                </div>
                            </div>

                            {/* Solo mostramos dirección si es envío a domicilio */}
                            {esEnvio && (
                                <div className="pt-3 border-t border-gray-200/50 mt-1">
                                    <p className="text-xs text-gray-500 mb-1">Dirección de despacho</p>
                                    <div className="flex items-start gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 mt-0.5">
                                            <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 leading-tight">
                                                {pedido?.direccion_envio}
                                            </p>
                                            {pedido?.comuna_envio && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {pedido?.comuna_envio}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECCIÓN 2: Productos (Tabla) */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Productos del Pedido</h4>
                        <div className="rounded-xl border border-gray-200/50 overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-200/50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Producto</th>
                                        <th className="px-4 py-3 font-medium text-center">Cant.</th>
                                        <th className="px-4 py-3 font-medium text-right">Precio</th>
                                        <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pedido?.items_pedidos && pedido.items_pedidos.length > 0 ? (
                                        pedido.items_pedidos.map((item: any, index: number) => {
                                            
                                            // Lógica para recuperar el nombre del producto de forma segura
                                            const nombreProducto = 
                                                item.producto?.nombre || 
                                                item.nombre_producto || 
                                                item.nombre || 
                                                'Producto sin nombre';

                                            const sku = item.producto?.sku || item.sku;
                                            const precio = Number(item.precio || item.monto || item.precio_unitario || 0);
                                            const cantidad = Number(item.cantidad || 1);
                                            const subtotal = Number(item.subtotal) || (precio * cantidad);

                                            return (
                                                <tr key={item.id || index} className="bg-white/40 hover:bg-white/60 transition-colors">
                                                    <td className="px-4 py-3 text-gray-800">
                                                        <div className="font-medium">{nombreProducto}</div>
                                                        {sku && <div className="text-xs text-gray-400 font-mono mt-0.5">SKU: {sku}</div>}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-600">
                                                        {cantidad}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-600">
                                                        {formatearMoneda(precio)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                                        {formatearMoneda(subtotal)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                                                No hay detalles de productos disponibles.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-blue-50/40 border-t border-blue-100/50">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right text-gray-600">Total Pedido:</td>
                                        <td className="px-4 py-3 text-right font-bold text-blue-700 text-lg">
                                            {formatearMoneda(pedido?.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* SECCIÓN 3: Información de Pagos */}
                    {pedido?.pagos && pedido.pagos.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Historial de Pagos</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {pedido.pagos.map((pago: any) => (
                                    <div 
                                        key={pago.id} 
                                        className="flex items-center justify-between p-3 rounded-xl border border-green-200/60 bg-green-50/40"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wide">
                                                {pago.metodo_pago || 'Pago registrado'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {formatearFechaHora(pago.createdAt)}
                                            </span>
                                        </div>
                                        <span className="font-bold text-green-700">
                                            {formatearMoneda(pago.monto)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- FOOTER --- */}
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200/50 flex justify-end gap-3">
                    <button 
                        onClick={handleClose}
                        className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm transition-all active:scale-95"
                    >
                        Cerrar detalle
                    </button>
                </div>
            </div>
        </div>
    );
}
'use client'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';


interface setIsModalOpenProps {
    setIsModalOpen: Dispatch<SetStateAction<boolean>>,
    isModalOpen: boolean,
    slugCategoria: string
}



export default function ModalCatalogo({ setIsModalOpen, slugCategoria, isModalOpen }: setIsModalOpenProps) {
    const [isOpen, setIsOpen] = useState(true); // control del modal
    const [isVisible, setIsVisible] = useState(false); // control de animación
    const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);

    const PDFViewerClient = dynamic(() => import('@/components/client/pdf/PDFViewerClient'), {
        ssr: false,
    });

    const handleClose = () => {
        setIsVisible(false); // inicia la animación de salida
        setTimeout(() => setIsOpen(false), 300); // esperar la animación antes de remover
        setTimeout(() => setIsModalOpen(false), 300);
    };

    useEffect(() => {
        if (isModalOpen) {
            setIsOpen(true)
            setIsVisible(true)
        }
    }, [setIsModalOpen])

    useEffect(() => {
        const fetchProductosCatalogo = async () => {
            try {
                const res = await fetch(`/api/productos-catalogo?slugCategoria=${slugCategoria}`);
                const data = await res.json();

                handleGenerarPDF(data);
            } catch (error) {
                console.error("Error al traer productos catalogo:", error);
            }
        };
        fetchProductosCatalogo();
    }, []);

    if (!isOpen) return null;



    const handleGenerarPDF = async (data: []) => {
        try {
            const res = await fetch('/api/generar-catalogo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Error al generar el PDF");

            const blob = await res.blob();
            const pdfUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            setPdfUrl(pdfUrl);
        } catch (error) {
            console.error("Error generando PDF:", error);
        }
    };


    return (
        <div
            className={`fixed inset-0 z-80 flex items-center justify-center bg-black/50 backdrop-blur-md transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
        >
            <div
                className={`bg-white rounded-lg shadow-lg max-w-5xl w-full h-[85vh] flex flex-col transform transition-transform duration-300 ${isVisible ? "scale-100" : "scale-95"
                    }`}
            >
                {/* Header con botón cerrar */}
                <div className="flex justify-between items-center bg-gray-100 border-b border-gray-300 px-5 py-3 rounded-t-lg">
                    <h2 className="text-lg font-semibold text-gray-700">
                        Catálogo de Productos
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-800 font-bold text-4xl leading-none"
                        aria-label="Cerrar"
                    >
                        &times;
                    </button>
                </div>

                {/* Contenido principal: visor PDF */}
                <div className="flex-1 p-4 overflow-hidden bg-white rounded-b-lg">
                    {pdfUrl ? (
                        <PDFViewerClient fileUrl={pdfUrl} />
                    ) : (
                        <div className="flex flex-col items-center mt-20 text-gray-600 animate-fade-in">
                            <div className="flex space-x-2 mb-3">
                                <span className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></span>
                            </div>
                            <p className="text-lg font-medium">Generando catálogo...</p>
                        </div>



                    )}
                </div>
            </div>
        </div>
    );


}

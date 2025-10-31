'use client'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { clearLine } from 'readline';



interface setIsModalOpenProps {
    setIsModalOpen: Dispatch<SetStateAction<boolean>>,
    isModalOpen: boolean,
    slugCategoria: string
}

interface Producto {
    id: number;
    name: string;
    description: string;
    additional_information: string;
    tag: string;
    stock: number;
    slug: string;
    categoria: Categoria[];
    images: ImageData[];
    price: number;
}
interface Categoria {
    nombre: string;
    slug: string;

}
interface ImageData {
    id: number;
    name: string;
    url: string;
}


export default function ModalCatalogo({ setIsModalOpen, slugCategoria, isModalOpen }: setIsModalOpenProps) {
    const [isOpen, setIsOpen] = useState(true); // control del modal
    const [isVisible, setIsVisible] = useState(false); // control de animación
    const [productosCatalogo, setProductosCatalogo] = useState<Producto[]>([]);
    const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);


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
                console.log(data)
                setProductosCatalogo(data);
                handleGenerarPDF(data);
            } catch (error) {
                console.error("Error al traer productos catalogo:", error);
            }
        };
        fetchProductosCatalogo();
    }, []);

    if (!isOpen) return null;



    const handleGenerarPDF = async (data: []) => {
        const res = await fetch('/api/generar-catalogo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data), // tus datos desde Strapi
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
    };

    return (
        <div
            className={`fixed inset-0 z-80 flex items-center justify-center bg-black/50 backdrop-blur-md transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
        >
             <iframe
                src={pdfUrl}
                className="w-full h-[80vh] rounded-lg border"
            ></iframe>


            <div
                className={`bg-white rounded-lg shadow-lg max-w-lg w-full h-fit p-4 relative transform transition-transform duration-300 ${isVisible ? "scale-100" : "scale-95"
                    }`}
            >
                {/* Botón cerrar */}
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold text-5xl"
                >
                    &times;
                </button>

            </div>

           
        </div>
    )
}

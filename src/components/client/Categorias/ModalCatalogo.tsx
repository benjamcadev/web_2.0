'use client'
import React, { Dispatch, SetStateAction, useState } from 'react'



interface setIsModalOpenProps {
    setIsModalOpen: Dispatch<SetStateAction<boolean>>,
    slugCategoria: string
}


export default function ModalCatalogo({ setIsModalOpen, slugCategoria }: setIsModalOpenProps) {
    const [isOpen, setIsOpen] = useState(true); // control del modal
    const [isVisible, setIsVisible] = useState(true); // control de animación


    const handleClose = () => {
        setIsVisible(false); // inicia la animación de salida
        setTimeout(() => setIsOpen(false), 300); // esperar la animación antes de remover
        setIsModalOpen(false)
    };

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-80 flex items-center justify-center bg-black/50 backdrop-blur-md transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
        >

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

            {slugCategoria}
        </div>
    )
}

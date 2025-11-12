import { useState, useEffect, useRef, useCallback } from 'react';
import { Cliente } from '../../types/cliente';
import { Yellowtail } from 'next/font/google';

const yellowtail = Yellowtail({
    weight: ['400'],
    subsets: ['latin'],
});

const CARD_WIDTH = 272; // Ancho de la tarjeta (w-64 = 256px) + gap (6 = 16px). 256 + 16 = 272

export default function ClientesInicio() {

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [scrollPosition, setScrollPosition] = useState(0); // Posición de desplazamiento
    const [isHovered, setIsHovered] = useState(false); // Para pausar el auto-scroll
    const sliderRef = useRef<HTMLDivElement>(null);

    // --- Lógica de Carga de Datos ---
    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const res = await fetch("/api/clientes-inicio");
                const data = await res.json();
                setClientes(data);
            } catch (error) {
                console.error("Error al traer clientes de pagina inicio:", error);
            }
        };
        fetchClientes();
    }, []);

    // --- Lógica de Bucle Infinito (Auto-Scroll) ---
    const handleAutoScroll = useCallback(() => {
        if (clientes.length === 0 || !sliderRef.current) return;

        // Si el usuario está interactuando, pausar el auto-scroll
        if (isHovered) return;

        setScrollPosition(prevPos => {
            const newPos = prevPos + 1; // Mover 1px por iteración
            const maxScroll = clientes.length * CARD_WIDTH;

            // Cuando la posición supera la mitad (donde termina el primer set de clientes)
            if (newPos >= maxScroll) {
                // Reiniciar el desplazamiento a 0 (el usuario no notará el salto)
                return 0;
            }
            return newPos;
        });
    }, [clientes.length, isHovered]);

    // Establecer el intervalo de auto-scroll
    useEffect(() => {
        const interval = setInterval(handleAutoScroll, 40); // Ajusta 40ms para la velocidad

        return () => clearInterval(interval);
    }, [handleAutoScroll]);

    // --- Lógica de Botones de Navegación ---
    const scroll = (direction: 'prev' | 'next') => {
        if (!sliderRef.current) return;

        const maxScroll = clientes.length * CARD_WIDTH;
        const jump = 3 * CARD_WIDTH; // Desplazar 3 tarjetas a la vez

        setScrollPosition(prevPos => {
            let newPos: number;

            if (direction === 'next') {
                newPos = prevPos + jump;
                // Si la posición excede el punto de "corte" del primer set de clientes, volvemos al inicio.
                if (newPos >= maxScroll) {
                    return 0; // Vuelve al inicio del primer set
                }
            } else { // 'prev'
                newPos = prevPos - jump;
                // Si la posición es menor a 0, saltamos al final del primer set (antes de la duplicación).
                if (newPos < 0) {
                    return maxScroll - jump; // Va casi al final del primer set
                }
            }
            return newPos;
        });
    };

    // La lista a renderizar es la original duplicada para el efecto de bucle
    const clientesToRender = [...clientes, ...clientes];


    // --- Estructura del Componente ---
    return (

        <div className="flex flex-col md:items-center mt-6 px-6 gap-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 ml-3 mr-3">

            <div className="relative pt-16 text-center">
                {/* Título y Descripción */}
                <h2
                    className={`${yellowtail.className} text-5xl md:text-7xl font-bold text-blue-950 drop-shadow-lg mb-6`}
                >
                    Nuestros Clientes
                </h2>
                <p className="max-w-3xl mx-auto text-blue-950 mb-6 leading-relaxed text-base md:text-lg">
                    Ellos ya confían en nosotros. Únete a la lista de nuestros clientes que alcanzan sus metas con nuestro apoyo.
                </p>

            </div>

            {/* --- Slider Contenedor --- */}
            <div
                className="relative w-full overflow-hidden py-6 pb-20"
                onMouseEnter={() => setIsHovered(true)} // Pausa el auto-scroll
                onMouseLeave={() => setIsHovered(false)} // Reanuda el auto-scroll
            >
                <div
                    ref={sliderRef}
                    className="flex gap-6 px-2"
                    style={{
                        transform: `translateX(-${scrollPosition}px)`,
                        transition: isHovered ? 'transform 0.5s ease-in-out' : 'none', // Transición solo con botones
                        width: `${clientesToRender.length * CARD_WIDTH}px` // Asegura el ancho total
                    }}
                >
                    {clientesToRender.map((cliente, index) => (
                        <a
                            // El index debe ser único, especialmente después de duplicar
                            key={`${cliente.id}-${index}`}
                            href={cliente.logo.url || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-shrink-0 w-64 bg-white/70 rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
                        >
                            <img
                                src={
                                    cliente.logo?.url?.startsWith("http")
                                        ? cliente.logo.url
                                        : `${process.env.NEXT_PUBLIC_STRAPI_URL}${cliente.logo?.url}`
                                }
                                alt={cliente.nombre}
                                className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
                            />

                        </a>
                    ))}
                </div>

                {/* --- Botones de Navegación --- */}
                {clientes.length > 0 && (
                    <>
                        {/* Botón Anterior */}
                        <button
                            onClick={() => scroll('prev')}
                            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg hover:bg-white transition-colors ml-4 z-10"
                            aria-label="Anterior cliente"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 text-blue-950">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>

                        {/* Botón Siguiente */}
                        <button
                            onClick={() => scroll('next')}
                            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg hover:bg-white transition-colors mr-4 z-10"
                            aria-label="Siguiente cliente"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 text-blue-950">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
            {/*  */}
        </div>
    )
}
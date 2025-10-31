"use client"
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { formatCLP } from '@/lib/formatCLP';

interface CategoriaEspecial {
    id: number;
    nombre: string;
    tipo_temporada: string;
    color: string;
    titulo_temporada: string;
}

interface ImageData {
    id: number;
    name: string;
    url: string;
}

interface Producto {
    id: number;
    name: string;
    description: string;
    additional_information: string;
    tag: string;
    stock: number;
    slug: string;
    categoria_especials: CategoriaEspecial[];
    images: ImageData[];
    price: number;
}




export default function Biodegradables() {

    const [productos, setProductos] = useState<Producto[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
    const AUTO_PLAY_INTERVAL = 5000; // 5 segundos



    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res = await fetch("/api/productos-biodegradables");
                const data = await res.json();
                setProductos(data);
            } catch (error) {
                console.error("Error al traer productos:", error);
            }
        };
        fetchProductos();
    }, []);

    // Auto-play
    useEffect(() => {
        if (productos.length <= 1 || isPaused || isAnimating) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % productos.length);
        }, AUTO_PLAY_INTERVAL);

        return () => clearInterval(interval);
    }, [currentIndex, productos.length, isPaused, isAnimating]);

    const nextSlide = () => {
        if (isAnimating || productos.length === 0) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % productos.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const prevSlide = () => {
        if (isAnimating || productos.length === 0) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + productos.length) % productos.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const goToSlide = (index: number) => {
        if (isAnimating || index === currentIndex) return;
        setIsAnimating(true);
        setCurrentIndex(index);
        setTimeout(() => setIsAnimating(false), 500);
    };

    if (productos.length === 0) {
        return (
            <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-2xl  flex items-center justify-center">
                <div className="text-white text-xl">Cargando productos...</div>
            </div>
        );
    }

    const currentProduct = productos[currentIndex];
    //setColor(currentProduct.categoria_especials[0]?.color || '#2C5282');
    const tituloTemporada = currentProduct.categoria_especials[0]?.titulo_temporada || '';

    return (
        <div
            className="relative w-full h-64 md:h-96 overflow-hidden rounded-2xl group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Título de la temporada */}
            {tituloTemporada && (
                <div className="absolute top-8 left-4 z-20 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs md:text-lg font-bold shadow-lg">
                    {tituloTemporada}
                </div>
            )}

            {/* Indicadores estilo Instagram */}
            <div className="absolute top-4 left-4 right-4 z-20 flex gap-1.5">
                {productos.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className="flex-1 h-1 rounded-full overflow-hidden bg-white/30 backdrop-blur-sm transition-all duration-300 hover:h-1.5"
                    >
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${index === currentIndex ? 'w-full bg-white' : 'w-0 bg-white/50'
                                }`}
                            style={{
                                backgroundColor: index === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.5)'
                            }}
                        />
                    </button>
                ))}
            </div>

            {/* Contenedor de imágenes */}
            <div className="relative w-full h-full">
                {productos.map((producto, index) => (
                    <div
                        key={producto.id}
                        className={`absolute inset-0 transition-all duration-500 ease-in-out ${index === currentIndex
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-95 pointer-events-none'
                            }`}
                    >

                        <div
                            className="w-full h-full relative"
                        >

                            {/* Imagen de fondo con overlay */}
                            <div className="absolute inset-0">
                                <Image
                                    src={`${STRAPI_URL}${producto.images[0]?.url}` || ''}
                                    alt={producto.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={index === 0}
                                />
                                {/* Overlay oscuro para mejor legibilidad */}
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

                            {/* Overlay con información */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 z-10">
                                <div className="text-white">
                                    {producto.price ? <span className=" gap-1 md:gap-3 bg-gradient-to-r from-lime-600 to-green-600 rounded-xl px-2 md:px-4 py-1 md:py-1 shadow-xl border border-white/10 text-lg md:text-2xl font-extrabold drop-shadow-md">{formatCLP(producto.price)}</span> : ''}
                                    <h3 className="text-md md:text-3xl font-bold mb-2">{producto.name}</h3>
                                    {producto.additional_information && (
                                        <p className="text-sm md:text-base text-white/90 mb-2">{producto.additional_information}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Botones de navegación */}
            {productos.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        disabled={isAnimating}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextSlide}
                        disabled={isAnimating}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}


        </div>
    );
}
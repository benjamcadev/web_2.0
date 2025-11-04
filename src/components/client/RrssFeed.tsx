"use client";
import { useEffect, useState } from "react";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import { Yellowtail } from 'next/font/google'

interface Post {
    id: number;
    texto: string;
    url: string;
    imagen: {
        url: string;
    };
}

const yellowtail = Yellowtail({
    weight: ['400'],
    subsets: ['latin'],
})

export default function RrssFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    // Cargar publicaciones desde Strapi
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/instagram-pruebas?populate=*`);
                const data = await res.json();
                setPosts(data.data || []);
            } catch (err) {
                console.error("Error al cargar publicaciones de Strapi:", err);
            }
        };
        fetchPosts();
    }, []);

    // Auto play para mobile (modo historia)
    useEffect(() => {
        if (posts.length > 0) {
            const interval = setInterval(() => {
                setActiveIndex((prev) => (prev + 1) % posts.length);
            }, 4000); // cambia cada 4s
            return () => clearInterval(interval);
        }
    }, [posts]);

    return (
        <section className="relative flex flex-col md:flex-row mt-6 px-6 gap-0 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 ml-3 mr-3 shadow-lg overflow-hidden">
            {/* Gradiente suave entre columnas */}
            {/* Gradiente suave solo entre las columnas */}
            <div className="hidden md:block absolute left-1/3 top-0 bottom-0 w-16 bg-gradient-to-r from-white/60 via-white/30 to-transparent pointer-events-none z-20" />


            {/* ==================== VERSIÓN DESKTOP ==================== */}
            <div className="hidden md:flex flex-row w-full z-10">
                {/* Columna izquierda */}
                <div className="relative md:w-1/3 flex flex-col justify-center items-start p-8 space-y-8">
                    <h2 className={`${yellowtail.className} text-5xl md:text-6xl font-bold text-blue-950 drop-shadow-lg mb-6`}>
                        Síguenos en redes sociales
                    </h2>

                    <p className="text-gray-700 text-base leading-relaxed">
                        Descubre nuestras últimas publicaciones, novedades y productos ecológicos 🌱
                    </p>

                    {/* Tarjetas de redes sociales */}
                    <div className="flex flex-row items-center justify-start gap-6 w-full mt-4">
                        {/* Instagram */}
                        <a
                            href="https://www.instagram.com/agroplasticls/"
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col items-center justify-center w-40 h-48 rounded-2xl shadow-md bg-gradient-to-tr from-pink-500/70 via-purple-500/70 to-yellow-400/70 text-white hover:scale-105 hover:shadow-lg transition-transform duration-300"
                        >
                            <FaInstagram className="text-5xl mb-3 drop-shadow-lg" />
                            <h3 className="text-lg font-semibold">Instagram</h3>
                            <p className="text-sm opacity-90 mt-1">3.5k seguidores</p>
                        </a>

                        {/* Facebook */}
                        <a
                            href="https://www.facebook.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col items-center justify-center w-40 h-48 rounded-2xl shadow-md bg-blue-600/70 text-white hover:scale-105 hover:shadow-lg transition-transform duration-300"
                        >
                            <FaFacebook className="text-5xl mb-3 drop-shadow-lg" />
                            <h3 className="text-lg font-semibold">Facebook</h3>
                            <p className="text-sm opacity-90 mt-1">2.2k seguidores</p>
                        </a>
                    </div>
                </div>

                {/* Columna derecha (carrusel horizontal) */}
                <div className="relative md:w-2/3 overflow-hidden py-6">
                    <div
                        className="flex animate-scroll gap-6 px-2"
                        style={{
                            animation: "scroll 40s linear infinite",
                        }}
                    >
                        {[...posts, ...posts].map((post, index) => (
                            <a
                                key={`${post.id}-${index}`}
                                href={post.url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-shrink-0 w-64 bg-white/70 rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
                            >
                                <img
                                    src={
                                        post.imagen?.url?.startsWith("http")
                                            ? post.imagen.url
                                            : `${process.env.NEXT_PUBLIC_STRAPI_URL}${post.imagen?.url}`
                                    }
                                    alt={post.texto}
                                    className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="p-3">
                                    <p className="text-sm text-gray-700 line-clamp-2">{post.texto}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* ==================== VERSIÓN MÓVIL ==================== */}
            <div className="flex md:hidden flex-col items-center justify-center w-full space-y-6 py-4">

                {/* Texto e íconos debajo */}
                <div className="text-center px-6">
                    <h2 className={`${yellowtail.className} text-5xl md:text-7xl font-bold text-blue-950 drop-shadow-lg mb-6`}>
                        Síguenos en redes sociales
                    </h2>
                    <p className="text-blue-950 text-sm mb-4">
                        Conoce nuestras últimas publicaciones y novedades
                    </p>
                    <div className="flex justify-center gap-4">
                        {/* Instagram */}
                        <a
                            href="https://www.instagram.com/agroplasticls/"
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col items-center justify-center w-32 h-40 rounded-2xl shadow-md bg-gradient-to-tr from-pink-500 via-purple-500 to-yellow-400 text-white hover:scale-105 hover:shadow-lg transition-transform duration-300"
                        >
                            <FaInstagram className="text-4xl mb-2 drop-shadow-lg" />
                            <p className="text-sm font-medium">3.5k seguidores</p>
                        </a>

                        {/* Facebook */}
                        <a
                            href="https://www.facebook.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col items-center justify-center w-32 h-40 rounded-2xl shadow-md bg-blue-600 text-white hover:scale-105 hover:shadow-lg transition-transform duration-300"
                        >
                            <FaFacebook className="text-4xl mb-2 drop-shadow-lg" />
                            <p className="text-sm font-medium">2.2k seguidores</p>
                        </a>
                    </div>
                </div>

                {/* Historia móvil */}
                <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg">
                    {posts.length > 0 && (
                        <>
                            <a
                                href={posts[activeIndex].url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0"
                            >
                                <img
                                    src={
                                        posts[activeIndex].imagen?.url?.startsWith("http")
                                            ? posts[activeIndex].imagen.url
                                            : `${process.env.NEXT_PUBLIC_STRAPI_URL}${posts[activeIndex].imagen?.url}`
                                    }
                                    alt={posts[activeIndex].texto}
                                    className="w-full h-full object-cover transition-all duration-700"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/100 via-black/80 to-transparent p-6 z-10">
                                    <p className="text-white text-sm leading-relaxed">
                                        {posts[activeIndex].texto}
                                    </p>
                                </div>
                            </a>

                            {/* Indicadores tipo historia */}
                            <div className="absolute top-3 left-0 right-0 flex justify-center gap-2">
                                {posts.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? "w-8 bg-white" : "w-3 bg-white/50"
                                            }`}
                                    ></span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

            </div>

            {/* Animaciones */}
            <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    );
}

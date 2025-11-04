"use client";
import { useEffect, useState } from "react";
import { FaInstagram } from "react-icons/fa";

export default function InstagramFeed() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/instagram")
      .then((res) => res.json())
      .then((data) => setPosts(data.data || []));
  }, []);

  return (
    <section className="flex flex-col md:flex-row mt-6 px-6 gap-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 ml-3 mr-3 shadow-lg overflow-hidden">
      {/* Columna izquierda */}
      <div className="md:w-1/3 flex flex-col justify-center items-start p-6 space-y-4">
        <div className="flex items-center gap-3">
          <FaInstagram className="text-pink-600 text-3xl" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Síguenos en Instagram
          </h2>
        </div>
        <p className="text-gray-700">
          Descubre nuestras últimas publicaciones, novedades y productos 🌱
        </p>
        <a
          href="https://www.instagram.com/agroplasticls/"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-2 text-sm font-semibold text-white bg-pink-600 px-4 py-2 rounded-full shadow hover:bg-pink-700 transition"
        >
          Ver perfil
        </a>
      </div>

      {/* Columna derecha (carrusel) */}
      <div className="md:w-2/3 relative overflow-hidden py-6">
        <div
          className="flex animate-scroll gap-6 px-2"
          style={{
            animation: "scroll 40s linear infinite",
          }}
        >
          {[...posts, ...posts].map((post, index) => (
            <a
              key={`${post.id}-${index}`}
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 w-64 bg-white/70 rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all"
            >
              <img
                src={post.media_url}
                alt={post.caption}
                className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="p-3">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {post.caption}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

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

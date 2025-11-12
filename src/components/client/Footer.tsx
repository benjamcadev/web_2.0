import { Facebook, Instagram, Mail, Phone, MapPin, Github } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-12 mx-3 mb-6 rounded-2xl 
      bg-gradient-to-br from-blue-950/60 via-blue-800/50 to-cyan-400/20 
      backdrop-blur-xl border border-white/20 shadow-2xl text-white">

      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Logo y descripción */}
        <div className="flex flex-col gap-3">
          <Image
            src="/logo.webp"
            alt="Logo Agroplastic"
            width={200}
            height={80}
            className="drop-shadow-lg hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all duration-300"
          />
          <p className="text-white/80 text-sm leading-relaxed">
            Más de 30 años ofreciendo soluciones en envases, productos compostables y materiales sostenibles para toda la Región de Coquimbo.
          </p>
        </div>

        {/* Enlaces */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-cyan-300">Navegación</h3>
          <ul className="flex flex-col gap-2 text-sm text-white/80">
            <li><Link href="/" className="hover:text-white transition">Inicio</Link></li>
            <li><Link href="/nosotros" className="hover:text-white transition">Tienda</Link></li>
            <li><Link href="/productos" className="hover:text-white transition">Empresas</Link></li>
            
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-cyan-300">Contacto</h3>
          <ul className="flex flex-col gap-3 text-sm text-white/80">
            <li className="flex items-center gap-2"><Phone size={16} /> +56 9 1234 5678</li>
            <li className="flex items-center gap-2"><Mail size={16} /> contacto@agroplastic.cl</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> Vicente Zorrilla 835, La Serena</li>
          </ul>
        </div>

        {/* Redes sociales */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-cyan-300">Síguenos</h3>
          <div className="flex gap-4">
            <Link href="https://www.facebook.com" target="_blank" className="p-3 bg-white/10 rounded-full hover:bg-cyan-400/30 transition">
              <Facebook size={20} />
            </Link>
            <Link href="https://www.instagram.com" target="_blank" className="p-3 bg-white/10 rounded-full hover:bg-cyan-400/30 transition">
              <Instagram size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-white/20 py-4 text-center text-sm text-white/70 bg-white/10 rounded-b-2xl">
        © {new Date().getFullYear()} Agroplastic Ltda. Todos los derechos reservados.
        <div className="mt-6 border-t border-white/20 pt-3 text-center text-white/60 text-xs tracking-wide">
          © 2025 — Desarrollado por{" "}
          <a
            href="https://github.com/benjamcadev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 hover:text-white transition"
          >
            @benjamcadev
          </a>
        </div>
      </div>

    </footer>
  );
}

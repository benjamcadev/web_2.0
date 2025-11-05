
import Image from 'next/image'
import { Truck, Package, ArrowDownCircle, Cake, Handbag } from "lucide-react";

export default function InfoEmpresa() {
    return (
        <div className="flex flex-col items-center text-center mt-6 px-8 py-12 gap-8 rounded-2xl 
      bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-cyan-400/40 
      backdrop-blur-xl border border-white/20 shadow-xl ml-3 mr-3 text-white">

            {/* Ícono central */}
            <div className="flex gap-2 flex-col items-center lg:gap-30 lg:flex-row mb-6">
                <div className="flex flex-col items-center gap-2 justify-center">
                    <div className="p-4 bg-white/10 rounded-full border border-white/20">
                        <Truck size={64} className="text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">Despachamos a la III y IV Región</h2>
                </div>

                <div className="flex flex-col items-center gap-2 justify-center">
                    <div className="p-4 bg-white/10 rounded-full border border-white/20">
                        <Handbag size={64} className="text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">Retira en 2 horas en compras por Callcenter</h2>

                </div>
            </div>

            {/* Sección de 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 w-full max-w-5xl">

                {/* Columna 1 */}
                <div className="flex flex-col items-center gap-3 px-4">
                    <ArrowDownCircle size={48} className="text-cyan-300" />
                    <h3 className="text-2xl font-semibold">Precios Bajos</h3>
                    <p className="text-white/80">
                        Precios económicos además de ofertas y descuentos semanales.
                    </p>
                </div>

                {/* Columna 2 */}
                <div className="flex flex-col items-center gap-3 px-4">
                    <Package size={48} className="text-cyan-300" />
                    <h3 className="text-2xl font-semibold">Envases y Packaging</h3>
                    <p className="text-white/80">
                        Almacena con envases de variados tipos de material.
                    </p>
                </div>

                {/* Columna 3 */}
                <div className="flex flex-col items-center gap-3 px-4">
                    <Cake size={48} className="text-cyan-300" />
                    <h3 className="text-2xl font-semibold">Alimentos y Repostería</h3>
                    <p className="text-white/80">
                        Los ingredientes que necesitas para hacer exquisitas creaciones.
                    </p>
                </div>
            </div>

            <div className="w-full h-30 relative mt-20">
                <div className="absolute inset-0">
                    <Image
                        src="/logo-5.webp"
                        alt="logo"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            </div>

        </div>
    );
}

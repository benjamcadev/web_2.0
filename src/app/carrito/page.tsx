import { Manrope } from "next/font/google";
import CarritoClient from "./CarritoClient";
import { Sucursal } from '@/types/sucursales'
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});



async function getSucursales(): Promise<Sucursal[]> {
  try {
   
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sucursales`, {
      // Importante: desactiva el cache si necesitas datos frescos
      cache: 'no-store',
      // O usa revalidación:
      // next: { revalidate: 3600 } // revalida cada hora
    });

    if (!response.ok) {
      throw new Error('Error al cargar sucursales');
    }

    const data = await response.json();
    
    return data.map((s: any) => ({
      id: s.id,
      nombre: s.nombre,
      comunas: s.comunas || [],
      costosEnvio: s.costos_envio || {},
      direccion: s.direccion
    }));
  } catch (error) {
    console.error("Error al cargar sucursales:", error);
    return [];
  }
}

// Server Component (por defecto en Next.js 14+)
export default async function CarritoPage() {
  // Esto se ejecuta en el servidor, NO en el navegador
  const sucursales = await getSucursales();

  return (
    <div className={manrope.className}>
      {/* Pasamos los datos al Client Component */}
      <CarritoClient initialSucursales={sucursales} />
    </div>
  );
}
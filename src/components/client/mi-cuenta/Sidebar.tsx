import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from "@/stores/useAuthStore";
import { PencilIcon } from '@heroicons/react/24/outline'

type Section = 'datos' | 'direcciones' | 'pedidos' | 'credito'

interface SidebarProps  {
   setSection: React.Dispatch<React.SetStateAction<Section>>;
   section: Section;
}

export default function Sidebar({ setSection, section }: SidebarProps) {
    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;
    const [isUploading, setIsUploading] = useState(false);
    const [logo, setLogo] = useState('');
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const cliente = useAuthStore((s) => s.cliente);
    const updateCliente = useAuthStore((s) => s.updateCliente);

    useEffect(() => {
                if (!cliente) return
               setLogo(cliente.logo?.url ?? '')
               setNombre(cliente.nombre ?? '')
               setCorreo(cliente.email ?? '')
        
            }, [cliente])


    const handleUploadImage = async (file: File) => {
            if (!cliente) return
    
            try {
                setIsUploading(true)
    
                const formData = new FormData()
                formData.append('image', file)
                formData.append('documentId', cliente.documentId)
    
                const res = await fetch('/api/mi-cuenta/save-image', {
                    method: 'POST',
                    body: formData,
                })
    
                if (!res.ok) {
                    throw new Error('Error al subir imagen')
                }
    
                const data = await res.json()
    
                if (!data?.cliente) {
                    throw new Error('Respuesta inválida del servidor')
                }
    
                // actualizar cliente en Zustand (para refrescar avatar)
                updateCliente(data.cliente)
    
            } catch (error) {
                console.error('Error subiendo imagen:', error)
            } finally {
                setIsUploading(false)
            }
        }
        

    return (
        <aside className="md:w-1/4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 p-4">

            {/* Avatar cliente */}
            <div className="flex flex-col items-center mb-6 relative">
                <div className="relative">
                    <div className="relative">
                        {logo ? (
                            <img
                                src={`${STRAPI_URL}${logo}`}
                                alt="Foto del cliente"
                                className={`w-24 h-24 rounded-full object-cover border border-white/50 shadow transition
                                            ${isUploading ? 'opacity-50' : ''}
                                        `}
                            />
                        ) : (
                            <div
                                className={`w-24 h-24 rounded-full flex items-center justify-center 
                                          bg-white/40 border border-white/50 shadow
                                          ${isUploading ? 'opacity-50' : ''}
                                        `}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-12 h-12 text-gray-500"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.5-1.632z"
                                    />
                                </svg>
                            </div>
                        )}

                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute bottom-0 right-0 bg-white/80 backdrop-blur rounded-full p-2 border border-white/40 hover:bg-white hover:scale-105 transition-all disabled:opacity-50"
                        title="Cambiar foto"
                    >
                        <PencilIcon className="w-4 h-4 text-gray-700" />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUploadImage(file)
                        }}
                    />
                </div>

                <p className="mt-3 text-sm font-semibold text-gray-800">
                    {nombre}
                </p>
                <p className="text-xs text-gray-600">
                    {correo}
                </p>
            </div>

            <h2 className="text-lg font-semibold mb-4">Mi Cuenta</h2>

            <nav className="flex md:flex-col gap-2">
                <SidebarButton
                    active={section === 'datos'}
                    onClick={() => setSection('datos')}
                    label="Datos personales"
                />
                <SidebarButton
                    active={section === 'direcciones'}
                    onClick={() => setSection('direcciones')}
                    label="Direcciones"
                />
                <SidebarButton
                    active={section === 'pedidos'}
                    onClick={() => setSection('pedidos')}
                    label="Pedidos"
                />
                <SidebarButton
                    active={section === 'credito'}
                    onClick={() => setSection('credito')}
                    label="Credito"
                />
            </nav>
        </aside>
    )
}

/* ---------- Sidebar Button ---------- */

function SidebarButton({
    label,
    active,
    onClick,
}: {
    label: string
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-2 rounded-xl transition
                ${active
                    ? 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white shadow'
                    : 'hover:bg-white/40'}
            `}
        >
            {label}
        </button>
    )
}


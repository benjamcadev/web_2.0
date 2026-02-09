import { useEffect, useState } from 'react'
import Input from '@/components/UI/Input'
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import ErrorToast from '@/components/UI/ErrorToast';
import SuccessToast from "@/components/UI/SuccessToast";
import LoadingToast from '@/components/UI/LoadingToast';
import { girosSiiOrdenados } from "@/lib/girosSII";

export default function DatosPersonales() {
    const cliente = useAuthStore((s) => s.cliente);
    const updateCliente = useAuthStore((s) => s.updateCliente);

    const [nombre, setNombre] = useState('')
    const [apellidos, setApellidos] = useState('')
    const [rut, setRut] = useState('')
    const [razonSocial, setRazonSocial] = useState('')
    const [giro, setGiro] = useState('')
    const [email, setEmail] = useState('')
    const [telefono, setTelefono] = useState('')
    
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [documentId, setDocumentId] = useState('')

    
    useEffect(() => {
        if (!cliente) return

        setNombre(cliente.nombre ?? '')
        setApellidos(cliente.apellidos ?? '')
        setRut(cliente.rut ?? '')
        setRazonSocial(cliente.razon_social ?? '')
        setGiro(cliente.giro ?? '')
        setEmail(cliente.email ?? '')
        setTelefono(cliente.telefono ?? '')
        setDocumentId(cliente.documentId)

    }, [cliente])

    const handleGuardar = async () => {
        const loadingToastLogin = toast.custom(
            <LoadingToast title="Actualizando datos" subtitle="Por favor espera un momento." />,
            {
                duration: Infinity,
                position: "bottom-center",
                icon: null,
                style: { background: "transparent", boxShadow: "none", padding: 0 },
            }
        );

        try {
            setIsSaving(true);

            const payload = {
                nombre,
                apellidos,
                razon_social: razonSocial,
                giro,
                email,
                telefono,
                documentId,
                rut: cliente.rut
            };

            const res = await fetch('/api/mi-cuenta/save-datos-personales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error('Error al guardar los datos');
            }

            const data = await res.json();

            if (!data?.cliente) {
                throw new Error('Respuesta inválida del servidor');
            }

            // Actualizar Zustand con cliente actualizado
            updateCliente(data.cliente);

            // Salir del modo edición
            setIsEditing(false);

            toast.custom(
                <SuccessToast title="Datos actualizados" subtitle="Tus cambios fueron guardados correctamente." />,
                {
                    duration: 2400,
                    position: "bottom-center",
                    icon: null,
                    style: { background: "transparent", boxShadow: "none", padding: 0 },
                }
            );
        } catch (error) {
            console.error('Error guardando datos personales', error);

            toast.custom(
                <ErrorToast title="Error" subtitle="Error al actualizar los datos." />,
                {
                    duration: 3000,
                    position: "bottom-center",
                    icon: null,
                    style: { background: "transparent", boxShadow: "none", padding: 0 },
                }
            );
        } finally {
            setIsSaving(false);
            toast.dismiss(loadingToastLogin);
        }
    }

    if (!cliente) {
        return (
            <div className="space-y-8">
                <h3 className="text-xl font-semibold">Datos personales</h3>

                {/* Skeleton formulario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-12" />
                    ))}
                </div>

                {/* Skeleton crédito */}
                <div className="rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 p-5 space-y-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                        <Skeleton className="h-16" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 bg-white/30 backdrop-blur-md border rounded-2xl p-6 shadow-sm transition-colors duration-300 border-white/40">
            <div className="flex items-center justify-between ">
                <h3 className="text-xl font-semibold">Datos personales</h3>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-sm text-gray-600">
                        {isEditing ? 'Edición activada' : 'Editar datos'}
                    </span>

                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={isEditing}
                            onChange={(e) => setIsEditing(e.target.checked)}
                            className="sr-only"
                        />
                        <div
                            className={`w-11 h-6 rounded-full transition
                                ${isEditing ? 'bg-green-600' : 'bg-gray-300'}
                            `}
                        />
                        <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition
                                ${isEditing ? 'translate-x-5 bg-white' : 'bg-white'}
                            `}
                        />
                    </div>
                </label>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="RUT" placeholder="12.345.678-9" value={rut} onChange={setRut} readOnly />
                <Input label="Nombre" placeholder="Juan" value={nombre} onChange={setNombre} readOnly={!isEditing} />
                <Input label="Apellido" placeholder="Pérez" value={apellidos} onChange={setApellidos} readOnly={!isEditing} />
                <Input label="Razón social" placeholder="Empresa SpA" value={razonSocial} onChange={setRazonSocial} readOnly={!isEditing} />
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-600">
                        Giro
                    </label>

                    <input
                        type="text"
                        list="lista-giros"
                        value={giro}
                        onChange={(e) => setGiro(e.target.value)}
                        readOnly={!isEditing}
                        className={`px-3 py-2 rounded-xl bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-blue-500
             transition ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />

                    <datalist id="lista-giros">
                        {girosSiiOrdenados.map((g) => (
                            <option key={g.codigo} value={g.giro} />
                        ))}
                    </datalist>

                </div>
                <Input label="Email" type="email" placeholder="correo@empresa.cl" value={email} onChange={setEmail} readOnly={!isEditing} />
                <Input label="Teléfono" placeholder="+56 9 1234 5678" value={telefono} onChange={setTelefono} readOnly={!isEditing} />
            </div>

            {isEditing && (
                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={handleGuardar}
                        disabled={isSaving}
                        className={`px-6 py-2 rounded-xl text-white transition shadow
                            ${isSaving
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }
                        `}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            )}

            

        </div>
    )
}




function Skeleton({ className }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-white/40 backdrop-blur border border-white/30 ${className}`}
        />
    )
}

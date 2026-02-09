import React, { useState, useRef } from 'react'
import Input from '@/components/UI/Input'
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import ErrorToast from '@/components/UI/ErrorToast';
import SuccessToast from "@/components/UI/SuccessToast";
import LoadingToast from '@/components/UI/LoadingToast';
import ConfirmToast from '@/components/UI/ConfirmToast'
import { comunasChile } from "@/lib/comunasChile"; 

export default function Direcciones() {
    const cliente = useAuthStore((s) => s.cliente);
    const updateCliente = useAuthStore((s) => s.updateCliente)
    const formRef = useRef<HTMLDivElement>(null);

    // Estados del formulario
    const [calle, setCalle] = useState('')
    const [numero, setNumero] = useState('')
    const [comuna, setComuna] = useState('')
    const [ciudad, setCiudad] = useState('')
    const [complemento, setComplemento] = useState('')
    const [esPrincipal, setEsPrincipal] = useState(false)
    
    // Estados de UI/Lógica
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)

    const direcciones = cliente?.direcciones ?? [];

    // --- LÓGICA: CARGAR DATOS PARA EDITAR ---
    const cargarDatosEdicion = (dir: any) => {
        setEditId(dir.id);
        setCalle(dir.calle);
        setNumero(dir.numero);
        setComuna(dir.comuna);
        setCiudad(dir.ciudad);
        setComplemento(dir.complemento || '');
        setEsPrincipal(dir.es_principal);

        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const cancelarEdicion = () => {
        setEditId(null);
        limpiarFormulario();
    };

    const limpiarFormulario = () => {
        setCalle('');
        setNumero('');
        setComuna('');
        setCiudad('');
        setComplemento('');
        setEsPrincipal(false);
    };

    // --- LÓGICA: ELIMINAR ---
    const confirmarEliminacion = (idDireccion: number) => {
        if (editId === idDireccion) cancelarEdicion();

        toast.custom(
            (t) => (
                <ConfirmToast
                    title="Eliminar dirección"
                    subtitle="¿Estás seguro de que deseas eliminar esta dirección?"
                    onCancel={() => toast.dismiss(t.id)}
                    onConfirm={() => {
                        toast.dismiss(t.id);
                        eliminarDireccion(idDireccion);
                    }}
                />
            ),
            { duration: Infinity }
        );
    };

    const eliminarDireccion = async (idDireccion: number) => {
        const loadingToastId = toast.custom(<LoadingToast title="Eliminando..." subtitle="Espera un momento" />);
        try {
            setIsDeleting(true);
            const res = await fetch('/api/mi-cuenta/delete-direccion', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: idDireccion, documentId: cliente?.documentId }),
            });
            if (!res.ok) throw new Error('Error');
            const data = await res.json();
            if (data?.cliente) updateCliente(data.cliente);
            toast.custom(<SuccessToast title="Eliminado" subtitle="Dirección borrada." />);
        } catch (e) {
            toast.custom(<ErrorToast title="Error" subtitle="No se pudo eliminar." />);
        } finally {
            setIsDeleting(false);
            toast.dismiss(loadingToastId);
        }
    };

    // --- LÓGICA: GUARDAR O ACTUALIZAR ---
    const procesarGuardado = async () => {
        if (!cliente) return
        
        if(!calle || !numero || !comuna || !ciudad) {
             toast.custom(<ErrorToast title="Campos incompletos" subtitle="Por favor llena los campos obligatorios." />);
             return;
        }

        const esEdicion = !!editId;
        
        const loadingToastId = toast.custom(
            <LoadingToast 
                title={esEdicion ? "Actualizando dirección" : "Guardando dirección"} 
                subtitle="Por favor espera..." 
            />,
            { duration: Infinity, position: "bottom-center" }
        );

        try {
            setIsSaving(true)
            const payload = {
                documentId: cliente.documentId,
                id: editId,
                calle,
                numero,
                comuna,
                ciudad,
                complemento: complemento || null,
                es_principal: esPrincipal,
                rut: cliente.rut
            }

            const endpoint = esEdicion ? '/api/mi-cuenta/update-direccion' : '/api/mi-cuenta/save-direccion';
            const method = esEdicion ? 'PUT' : 'POST';

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error('Error al procesar')

            const data = await res.json()
            if (!data?.cliente) throw new Error('Respuesta inválida')

            updateCliente(data.cliente)
            
            if (esEdicion) {
                setEditId(null);
                toast.custom(<SuccessToast title="Actualizado" subtitle="La dirección ha sido modificada." />);
            } else {
                toast.custom(<SuccessToast title="Guardado" subtitle="Nueva dirección agregada." />);
            }
            limpiarFormulario();

        } catch (error) {
            console.error(error);
            toast.custom(<ErrorToast title="Error" subtitle="No se pudo procesar la solicitud." />);
        } finally {
            setIsSaving(false)
            toast.dismiss(loadingToastId)
        }
    }

    const handleGuardarClick = () => {
        if (esPrincipal) {
             toast.custom((t) => (
                <ConfirmToast
                    title="¿Marcar como principal?"
                    subtitle="Esta será tu dirección predeterminada para envíos."
                    onCancel={() => toast.dismiss(t.id)}
                    onConfirm={() => {
                        toast.dismiss(t.id);
                        procesarGuardado();
                    }}
                />
            ));
        } else {
            procesarGuardado();
        }
    }

    return (
        <div className="space-y-8">
            {/* --- LISTADO --- */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Mis Direcciones</h3>
                <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/30 overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-white/60 text-gray-600 border-b border-white/20">
                            <tr className="text-left">
                                <th className="px-5 py-4 font-medium">Dirección</th>
                                <th className="px-5 py-4 font-medium hidden sm:table-cell">Comuna</th>
                                <th className="px-5 py-4 font-medium hidden md:table-cell">Ciudad</th>
                                <th className="px-5 py-4 font-medium text-center">Estado</th>
                                <th className="px-5 py-4 font-medium text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20">
                            {direcciones.length === 0 ? (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500">No hay direcciones.</td></tr>
                            ) : (
                                direcciones.map((dir: any) => (
                                    <tr key={dir.id} className={`transition-colors duration-200 ${editId === dir.id ? 'bg-blue-100/50' : 'hover:bg-blue-50/30'}`}>
                                        <td className="px-5 py-4 text-gray-800">
                                            <div className="font-medium">{dir.calle} #{dir.numero}</div>
                                            {dir.complemento && <div className="text-xs text-gray-500 mt-0.5">{dir.complemento}</div>}
                                            <div className="sm:hidden text-xs text-gray-400 mt-1">{dir.comuna}, {dir.ciudad}</div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 hidden sm:table-cell">{dir.comuna}</td>
                                        <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{dir.ciudad}</td>
                                        <td className="px-5 py-4 text-center">
                                            {dir.es_principal && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">Principal</span>}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => cargarDatosEdicion(dir)}
                                                    disabled={isDeleting || isSaving}
                                                    className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                                                    title="Editar dirección"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => confirmarEliminacion(dir.id)}
                                                    disabled={isDeleting || isSaving}
                                                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                                                    title="Eliminar dirección"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- FORMULARIO --- */}
            <div ref={formRef}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {editId ? 'Editar dirección' : 'Agregar nueva dirección'}
                    </h3>
                </div>
                
                <div className={`
                    bg-white/40 backdrop-blur-md border rounded-2xl p-6 shadow-sm transition-colors duration-300
                    ${editId ? 'border-blue-400/50 bg-blue-50/20' : 'border-white/40'}
                `}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <Input label="Calle" value={calle} onChange={setCalle} placeholder="Ej: Av. Providencia" />
                        <Input label="Número" value={numero} onChange={setNumero} placeholder="Ej: 1234" />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-gray-700 ml-1">Comuna</label>
                            <input
                                type="text"
                                list="lista-comunas"
                                value={comuna}
                                onChange={(e) => setComuna(e.target.value)}
                                placeholder="Escribe o selecciona..."
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            {comunasChile && <datalist id="lista-comunas">{comunasChile.map((c: string) => <option key={c} value={c} />)}</datalist>}
                        </div>
                        <Input label="Ciudad" value={ciudad} onChange={setCiudad} placeholder="Ej: Santiago" />
                        <div className="md:col-span-2">
                            <Input label="Indicaciones (Opcional)" value={complemento} onChange={setComplemento} placeholder="Ej: Torre B..." />
                        </div>
                    </div>

                    {/* ZONA DE ACCIONES */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200/50">
                        
                        {/* SWITCH PRINCIPAL (Nuevo Estilo) */}
                        <label className="flex items-center gap-3 cursor-pointer select-none group w-full sm:w-auto">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={esPrincipal}
                                    onChange={(e) => setEsPrincipal(e.target.checked)}
                                    className="sr-only" // Oculta el input original
                                />
                                <div
                                    className={`w-11 h-6 rounded-full transition-colors duration-300
                                        ${esPrincipal ? 'bg-blue-600' : 'bg-gray-300'}
                                    `}
                                />
                                <div
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300
                                        ${esPrincipal ? 'translate-x-5' : 'translate-x-0'}
                                    `}
                                />
                            </div>
                            <span className={`text-sm font-medium transition-colors ${esPrincipal ? 'text-blue-700' : 'text-gray-600'}`}>
                                Marcar como dirección principal
                            </span>
                        </label>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            {/* BOTÓN CANCELAR */}
                            {editId && (
                                <button
                                    onClick={cancelarEdicion}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                                >
                                    Cancelar
                                </button>
                            )}

                            {/* BOTÓN GUARDAR */}
                            <button
                                onClick={handleGuardarClick}
                                disabled={isSaving}
                                className={`
                                    px-6 py-2.5 rounded-xl text-white font-medium shadow-lg 
                                    transition-all duration-200 transform active:scale-95
                                    ${isSaving
                                        ? 'bg-blue-400 cursor-not-allowed opacity-70'
                                        : editId 
                                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' 
                                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                                    }
                                `}
                            >
                                {isSaving ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        {editId ? 'Actualizando...' : 'Guardando...'}
                                    </span>
                                ) : (editId ? 'Actualizar Dirección' : 'Guardar Dirección')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
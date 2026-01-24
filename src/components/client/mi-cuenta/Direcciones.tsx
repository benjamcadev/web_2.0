import React, { useState } from 'react'
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

    const [calle, setCalle] = useState('')
    const [numero, setNumero] = useState('')
    const [comuna, setComuna] = useState('')
    const [ciudad, setCiudad] = useState('')
    const [complemento, setComplemento] = useState('')
    const [esPrincipal, setEsPrincipal] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const direcciones = cliente?.direcciones ?? [];

    const guardarDireccion = async () => {
        if (!cliente) return

        const loadingToastLogin = toast.custom(
            <LoadingToast title="Agregando nueva dirección" subtitle="Por favor espera un momento." />,
            {
                duration: Infinity,
                position: "bottom-center",
                icon: null,
                style: { background: "transparent", boxShadow: "none", padding: 0 },
            }
        );

        try {
            setIsSaving(true)

            const payload = {
                documentId: cliente.documentId,
                calle,
                numero,
                comuna,
                ciudad,
                complemento: complemento || null,
                es_principal: esPrincipal,
                rut: cliente.rut
            }

            const res = await fetch('/api/mi-cuenta/save-direccion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                throw new Error('Error al guardar dirección')
            }

            const data = await res.json()

            if (!data?.cliente) {
                throw new Error('Respuesta inválida del servidor')
            }

            // actualizar Zustand
            console.log(data.cliente)
            updateCliente(data.cliente)

            // limpiar formulario
            setCalle('')
            setNumero('')
            setComuna('')
            setCiudad('')
            setComplemento('')
            setEsPrincipal(false)

            toast.custom(
                <SuccessToast title="Dirección guardada correctamente" subtitle="" />,
                {
                    duration: 2400,
                    position: "bottom-center",
                    icon: null,
                    style: { background: "transparent", boxShadow: "none", padding: 0 },
                }
            );

        } catch (error) {
            toast.custom(
                <ErrorToast title="Error" subtitle="Error al guardar la dirección" />,
                {
                    duration: 3000,
                    position: "bottom-center",
                    icon: null,
                    style: { background: "transparent", boxShadow: "none", padding: 0 },
                }
            );
        } finally {
            setIsSaving(false)
            toast.dismiss(loadingToastLogin)
        }
    }

    const handleGuardarDireccion = () => {
        if (esPrincipal) {
            toast.custom(
                (t) => (
                    <ConfirmToast
                        title="Dirección principal"
                        subtitle="Ha marcado la nueva dirección como principal, ¿desea continuar?"
                        onCancel={() => toast.dismiss(t.id)}
                        onConfirm={() => {
                            toast.dismiss(t.id)
                            guardarDireccion()
                        }}
                    />
                ),
                { duration: Infinity }
            )

            return
        }

        // si NO es principal → guardar directo
        guardarDireccion()
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Direcciones</h3>

            <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/30 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-white/60">
                        <tr className="text-left text-gray-600">
                            <th className="px-4 py-3">Dirección</th>
                            <th className="px-4 py-3">Comuna</th>
                            <th className="px-4 py-3">Ciudad</th>
                            <th className="px-4 py-3 text-center">Principal</th>
                        </tr>
                    </thead>

                    <tbody>
                        {direcciones.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-6 text-center text-gray-500"
                                >
                                    No hay direcciones registradas
                                </td>
                            </tr>
                        )}

                        {direcciones.map((dir: any) => (
                            <tr
                                key={dir.id}
                                className="border-t border-white/30 hover:bg-white/40 transition"
                            >
                                <td className="px-4 py-3">
                                    {dir.calle} {dir.numero}
                                    {dir.complemento && (
                                        <span className="text-gray-500">
                                            {` (${dir.complemento})`}
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-3">{dir.comuna}</td>
                                <td className="px-4 py-3">{dir.ciudad}</td>

                                <td className="px-4 py-3 text-center">
                                    {dir.es_principal ? (
                                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-700">
                                            Principal
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h3 className="text-xl font-semibold">Agregar dirección</h3>

            <div className=" p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Calle" value={calle} onChange={setCalle} />
                    <Input label="Número" value={numero} onChange={setNumero} />
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600">
                            Comuna
                        </label>

                        <input
                            type="text"
                            list="lista-comunas"
                            value={comuna}
                            onChange={(e) => setComuna(e.target.value)}
                            className="
                                px-3 py-2 rounded-xl border border-gray-300
                                bg-white/70 backdrop-blur
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                transition
                            "
                        />

                        <datalist id="lista-comunas">
                            {comunasChile.map((c: string) => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                    </div>
                    <Input label="Ciudad" value={ciudad} onChange={setCiudad} />
                    <Input
                        label="Indicaciones Adicionales"
                        value={complemento}
                        onChange={setComplemento}
                    />
                </div>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={esPrincipal}
                        onChange={(e) => setEsPrincipal(e.target.checked)}
                        className="rounded"
                    />
                    Dirección principal
                </label>

                <button
                    onClick={handleGuardarDireccion}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-xl text-white transition
                        ${isSaving
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }
                    `}
                >
                    {isSaving ? 'Guardando...' : 'Guardar nueva dirección'}
                </button>
            </div>
        </div>
    )
}

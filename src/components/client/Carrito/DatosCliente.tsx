import { Dispatch, SetStateAction } from 'react'
import { formatRut } from "@/lib/formatRut";
import { validateRut } from "@/lib/validateRut";
import { girosSiiOrdenados } from "@/lib/girosSII";
import { comunasChile } from "@/lib/comunasChile";
import type { GiroSii } from "@/lib/girosSII";
import { Cliente } from '@/types/cliente'


interface DatosClienteProps {
    tipoDTE: string;
    cliente: Cliente;
    setCliente: Dispatch<SetStateAction<Cliente>>;
    emailIsInvalid: boolean;
    direccionesCliente: any[];
    direccionSeleccionada: any | null;
    setDireccionSeleccionada: Dispatch<SetStateAction<any | null>>;
}

export default function DatosCliente({
    tipoDTE,
    cliente,
    setCliente,
    emailIsInvalid,
    direccionesCliente,
    direccionSeleccionada,
    setDireccionSeleccionada,
}: DatosClienteProps) {
    // --- FACTURA ERRORS helper ---
    const facturaErrors = tipoDTE === "factura" && cliente.factura
        ? {
            razonSocial: cliente.factura.razonSocial.trim().length === 0,
            giro: cliente.factura.giro.trim().length === 0,
            calle: cliente.factura.calle.trim().length === 0,
            numero: cliente.factura.numero.trim().length === 0,
            comuna: cliente.factura.comuna.trim().length === 0,
            ciudad: cliente.factura.ciudad.trim().length === 0,
        }
        : null;

    return (
        <>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">
                    Datos del cliente
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tipoDTE === "boleta" && (
                        <div>
                            <input
                                type="text"
                                placeholder="Nombre y apellido"
                                value={cliente.nombre}
                                onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}


                    <div>
                        <input
                            type="text"
                            placeholder="RUT"
                            value={cliente.rut}
                            onChange={(e) => {
                                const rawValue = e.target.value.replace(/[^0-9kK]/g, "");
                                const formatted = formatRut(rawValue);

                                setCliente({ ...cliente, rut: formatted })
                            }}
                            className={`w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500
                ${cliente.rut && !validateRut(cliente.rut) ? "border-red-500 text-red-600" : "border-gray-300"}`}
                        />

                        {cliente.rut && !validateRut(cliente.rut) && (
                            <p className="text-red-600 text-sm mt-1">RUT inválido</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Teléfono"
                            value={cliente.telefono}
                            onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={cliente.email}
                            onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl bg-white border transition focus:ring-2
                ${emailIsInvalid
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                                }`}
                        />


                        {emailIsInvalid && (
                            <p className="text-red-600 text-sm mt-1">
                                Correo electrónico inválido
                            </p>
                        )}
                    </div>

                </div>

                {tipoDTE === "factura" && (
                    <div className="mt-6 space-y-4">
                        <h4 className="font-semibold text-gray-800">
                            Datos para Factura <span className="text-red-600">*</span>
                        </h4>
                        <p className="text-sm text-gray-500">
                            Los campos marcados con <span className="text-red-600">*</span> son obligatorios
                        </p>




                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Razón Social */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Razón Social <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={cliente.factura?.razonSocial ?? ""}
                                    onChange={(e) =>
                                        setCliente((prev) => ({
                                            ...prev,
                                            factura: { ...prev.factura!, razonSocial: e.target.value }
                                        }))
                                    }
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2
                      ${facturaErrors?.razonSocial
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                />
                                {facturaErrors?.razonSocial && (
                                    <p className="text-red-600 text-sm mt-1">Campo obligatorio</p>
                                )}
                            </div>

                            {/* Giro (autocomplete + escritura libre) */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Giro <span className="text-red-600">*</span>
                                </label>

                                <input
                                    type="text"
                                    list="giros-sii-list"
                                    placeholder="Ej: Venta al por menor de envases plásticos"
                                    value={cliente.factura?.giro ?? ""}
                                    onChange={(e) =>
                                        setCliente((prev) => ({
                                            ...prev,
                                            factura: { ...prev.factura!, giro: e.target.value }
                                        }))
                                    }
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2
                      ${facturaErrors?.giro
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                />

                                <datalist id="giros-sii-list">
                                    {girosSiiOrdenados.map((giro: GiroSii) => (
                                        <option key={giro.codigo ?? giro.giro} value={giro.giro} />
                                    ))}
                                </datalist>

                                {facturaErrors?.giro && (
                                    <p className="text-red-600 text-sm mt-1">Campo obligatorio</p>
                                )}
                            </div>

                        </div>

                        {direccionesCliente.length > 0 && (
                            <div className='mt-10'>
                                <label className="text-sm font-medium text-gray-700">
                                    Dirección registrada
                                </label>
                                <select
                                    value={direccionSeleccionada?.id ?? ""}
                                    onChange={(e) => {
                                        const dir = direccionesCliente.find(
                                            (d) => d.id === Number(e.target.value)
                                        );

                                        setDireccionSeleccionada(dir);

                                        if (!dir) return;

                                        setCliente((prev) => ({
                                            ...prev,
                                            factura: {
                                                ...prev.factura!,
                                                calle: dir.calle ?? "",
                                                numero: dir.numero ?? "",
                                                comuna: dir.comuna ?? "",
                                                ciudad: dir.ciudad ?? "",
                                                complemento: dir.complemento ?? "",
                                            },
                                        }));
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Selecciona una dirección</option>
                                    {direccionesCliente.map((dir) => (
                                        <option key={dir.id} value={dir.id}>
                                            {dir.calle} {dir.numero}, {dir.comuna}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Calle */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Calle <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={cliente.factura?.calle ?? ""}
                                    onChange={(e) =>
                                        setCliente((prev) => ({
                                            ...prev,
                                            factura: { ...prev.factura!, calle: e.target.value }
                                        }))
                                    }
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2
                      ${facturaErrors?.calle
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                />
                                {facturaErrors?.calle && (
                                    <p className="text-red-600 text-sm mt-1">Campo obligatorio</p>
                                )}
                            </div>

                            {/* Número */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Número <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={cliente.factura?.numero ?? ""}
                                    onChange={(e) =>
                                        setCliente((prev) => ({
                                            ...prev,
                                            factura: { ...prev.factura!, numero: e.target.value }
                                        }))
                                    }
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2
                      ${facturaErrors?.numero
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                />
                                {facturaErrors?.numero && (
                                    <p className="text-red-600 text-sm mt-1">Campo obligatorio</p>
                                )}
                            </div>

                            {/* Complemento (opcional) */}
                            <input
                                type="text"
                                placeholder="Depto / Oficina / Casa (opcional)"
                                value={cliente.factura?.complemento ?? ""}
                                onChange={(e) =>
                                    setCliente((prev) => ({
                                        ...prev,
                                        factura: {
                                            ...prev.factura!,
                                            complemento: e.target.value
                                        }
                                    }))
                                }
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 md:col-span-2"
                            />

                            {/* Comuna (con buscador) */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Comuna <span className="text-red-600">*</span>
                                </label>
                                <input
                                    list="comunas-list"
                                    value={cliente.factura?.comuna ?? ""}
                                    onChange={(e) =>
                                        setCliente((prev) => ({
                                            ...prev,
                                            factura: { ...prev.factura!, comuna: e.target.value }
                                        }))
                                    }
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2
                      ${facturaErrors?.comuna
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                />
                                {facturaErrors?.comuna && (
                                    <p className="text-red-600 text-sm mt-1">Campo obligatorio</p>
                                )}
                                <datalist id="comunas-list">
                                    {[...comunasChile]
                                        .sort((a, b) => a.localeCompare(b, "es"))
                                        .map((comuna) => (
                                            <option key={comuna} value={comuna} />
                                        ))}
                                </datalist>
                            </div>

                            {/* Ciudad */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Ciudad / Localidad <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={cliente.factura?.ciudad ?? ""}
                                    onChange={(e) =>
                                        setCliente((prev) => ({
                                            ...prev,
                                            factura: { ...prev.factura!, ciudad: e.target.value }
                                        }))
                                    }
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2
                      ${facturaErrors?.ciudad
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                />
                                {facturaErrors?.ciudad && (
                                    <p className="text-red-600 text-sm mt-1">Campo obligatorio</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </>
    )
}

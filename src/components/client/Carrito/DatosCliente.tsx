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

    // Validaciones de campos de factura
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

    // --- LÓGICA DE CRÉDITO / CONDICIÓN DE PAGO ---
    const opcionesPago = [{ value: "contado", label: "Contado" }];

    // PRIMERO: Verificamos si tiene el crédito habilitado globalmente
    if (cliente.credito_habilitado) {
        // LUEGO: Verificamos los plazos específicos
        if (cliente.credito_7) {
            opcionesPago.push({ value: "7", label: "Crédito 7 días" });
        }
        if (cliente.credito_15) {
            opcionesPago.push({ value: "15", label: "Crédito 15 días" });
        }
        if (cliente.credito_30) {
            opcionesPago.push({ value: "30", label: "Crédito 30 días" });
        }
        if (cliente.credito_60) {
            opcionesPago.push({ value: "60", label: "Crédito 60 días" });
        }
        if (cliente.credito_90) {
            opcionesPago.push({ value: "90", label: "Crédito 90 días" });
        }
    }

    return (
        <>
            <div className="space-y-6">
                {/* --- SECCION DATOS DE CONTACTO --- */}
                <div className="bg-indigo-100/50 p-6 rounded-2xl border border-indigo-200 ">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Datos de Contacto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Nombre <span className="text-red-600">*</span></label>
                            <input
                                type="text"
                                value={cliente.nombre}
                                onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border focus:ring-2 transition-all bg-white "
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email <span className="text-red-600">*</span></label>
                            <input
                                type="email"
                                value={cliente.email}
                                onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition-all bg-white
                                ${emailIsInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                            />
                            {emailIsInvalid && <p className="text-red-500 text-xs mt-1">Ingresa un correo válido</p>}
                        </div>
                        {/* Teléfono */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Teléfono<span className="text-red-600">*</span></label>
                            <input
                                type="tel"
                                value={cliente.telefono || ""}
                                onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                                placeholder="+569..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* --- SECCION DATOS DE FACTURACIÓN --- */}
                {tipoDTE === "factura" && (
                    <div className="bg-blue-100/50 p-6 rounded-2xl border border-blue-200 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Datos de Facturación
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* RUT Empresa */}
                            <div className="md:col-span-1">
                                <label className="text-sm font-medium text-gray-700">
                                    RUT Empresa <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={cliente.rut}
                                    onChange={(e) => {
                                        const val = formatRut(e.target.value);
                                        setCliente((prev) => ({
                                            ...prev,
                                            rut: val
                                        }));
                                    }}
                                    maxLength={12}
                                    placeholder="76.xxx.xxx-x"
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 bg-white
                                    ${cliente.rut && !validateRut(cliente.rut)
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                />
                            </div>

                            {/* Razón Social */}
                            <div className="md:col-span-2">
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
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 bg-white
                                    ${facturaErrors?.razonSocial
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                />
                                {facturaErrors?.razonSocial && (
                                    <p className="text-red-600 text-sm mt-1">Campo obligatorio</p>
                                )}
                            </div>

                            {/* Giro - Ocupa 2 columnas */}
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Giro Comercial <span className="text-red-600">*</span>
                                </label>
                                <input
                                    list="giros-sii"
                                    type="text"
                                    value={cliente.factura?.giro ?? ""}
                                    onChange={(e) =>
                                        setCliente((prev) => ({
                                            ...prev,
                                            factura: { ...prev.factura!, giro: e.target.value }
                                        }))
                                    }
                                    placeholder="Escribe para buscar..."
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 bg-white
                                    ${facturaErrors?.giro
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                />
                                <datalist id="giros-sii">
                                    {girosSiiOrdenados.map((g: GiroSii) => (
                                        <option key={g.codigo} value={g.giro} />
                                    ))}
                                </datalist>
                                {facturaErrors?.giro && (
                                    <p className="text-red-600 text-sm mt-1">Campo obligatorio</p>
                                )}
                            </div>

                           
                            {/* --- CONDICIÓN DE PAGO --- */}
                            <div className="md:col-span-1">
                                <label className="text-sm font-medium text-gray-700">
                                    Condición de Pago
                                </label>
                                <select
                                    // Si no existe valor, por defecto es "contado"
                                    value={cliente.factura?.condicionPago || "contado"}

                                    // AQUÍ ESTÁ LA CLAVE: Guardamos la selección en el estado global del cliente
                                    onChange={(e) =>
                                        setCliente((prev) => ({
                                            ...prev,
                                            factura: {
                                                ...prev.factura!, // Mantenemos Rut, Razón Social, etc.
                                                condicionPago: e.target.value
                                            }
                                        }))
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    {opcionesPago.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>


                            {/* Dirección Tributaria */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-4 bg-white rounded-xl border border-blue-100">
                                <p className="md:col-span-2 text-sm font-bold text-blue-800 border-b pb-2 mb-2">
                                    Dirección Tributaria
                                </p>

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

                                {/* Comuna */}
                                <div>
                                    <label className="text-sm font-medium text-gray-700">
                                        Comuna <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        list="comunas-chile"
                                        type="text"
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
                                    <datalist id="comunas-chile">
                                        {comunasChile.map((c) => (
                                            <option key={c} value={c} />
                                        ))}
                                    </datalist>
                                    {facturaErrors?.comuna && (
                                        <p className="text-red-600 text-sm mt-1">Campo obligatorio</p>
                                    )}
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
                    </div>
                )}
            </div>
        </>
    )
}
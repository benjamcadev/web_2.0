"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import { BuildingStorefrontIcon, TruckIcon } from "@heroicons/react/24/outline";
import { Sucursal } from '@/types/sucursales';
import { useState, Dispatch, SetStateAction, useEffect } from 'react'
import { formatRut } from "@/lib/formatRut";
import { validateRut } from "@/lib/validateRut";
import { Cliente } from '@/types/cliente'
import { comunasChile } from "@/lib/comunasChile";
import { girosSiiOrdenados } from "@/lib/girosSII";
import type { GiroSii } from "@/lib/girosSII";

type DeliveryType = "retiro" | "envio" | null;

interface ComunaEncontrada {
  sucursal: Sucursal;
  comuna: string;
  costo: number;
}

interface PagoProps {
  deliveryType: DeliveryType;
  selectedSucursal: Sucursal | null;
  comunaEncontrada: ComunaEncontrada | null;
  direccion: string;
  metodoPago: "webpay" | "khipu" | null;
  setMetodoPago: (metodo: "webpay" | "khipu" | null) => void;
  cliente: Cliente;
  setCliente: Dispatch<SetStateAction<Cliente>>;
  isAuthenticated: boolean;
  totalFinal: number; // total a pagar luego de aplicar giftcard (puede ser 0)
  giftcardApplied: number; // monto aplicado de giftcard (0 si no hay giftcard aplicada)
  tipoDTE: string;
  setTipoDTE: Dispatch<SetStateAction<"boleta" | "factura">>
}

export default function Paso3Pago({
  deliveryType,
  selectedSucursal,
  comunaEncontrada,
  direccion,
  metodoPago,
  setMetodoPago,
  cliente,
  setCliente,
  isAuthenticated,
  totalFinal,
  giftcardApplied,
  tipoDTE,
  setTipoDTE
}: PagoProps) {

  const [facturaComuna, setFacturaComuna] = useState("");
  const [facturaCiudad, setFacturaCiudad] = useState("");

  const emailIsInvalid =
    cliente.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email);

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

  const customerDataIsValid =
    isAuthenticated ||
    (
      !emailIsInvalid &&
      cliente.email.trim().length > 0 &&
      cliente.rut.trim().length > 0 &&
      (cliente.telefono ?? "").trim().length > 0 &&
      (
        // BOLETA
        (tipoDTE === "boleta" &&
          cliente.nombre.trim().length > 0
        ) ||

        // FACTURA
        (tipoDTE === "factura" &&
          cliente.factura &&
          cliente.factura.razonSocial.trim().length > 0 &&
          cliente.factura.giro.trim().length > 0 &&
          cliente.factura.calle.trim().length > 0 &&
          cliente.factura.numero.trim().length > 0 &&
          cliente.factura.comuna.trim().length > 0 &&
          cliente.factura.ciudad.trim().length > 0
        )
      )
    );

  const giftcardCubreTodo = giftcardApplied > 0 && totalFinal === 0;


  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen de tu pedido</h2>

      {/* --- MÉTODO DE ENTREGA --- */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h3 className="font-bold text-gray-900 mb-3">Método de entrega:</h3>

        {deliveryType === "retiro" && selectedSucursal && (
          <div className="flex items-start gap-3">
            <BuildingStorefrontIcon className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-700">Retiro en tienda</p>
              <p className="text-sm text-gray-600">{selectedSucursal.nombre}</p>
              <p className="text-sm text-gray-600">{selectedSucursal.direccion}</p>
            </div>
          </div>
        )}

        {deliveryType === "envio" && comunaEncontrada && (
          <div className="flex items-start gap-3">
            <TruckIcon className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-700">Envío a domicilio</p>
              <p className="text-sm text-gray-600">{comunaEncontrada.comuna} - {direccion}</p>
              <p className="text-sm text-gray-600">Desde: {comunaEncontrada.sucursal.nombre}</p>
            </div>
          </div>
        )}
      </div>

      {/* --- TIPO DTE --- */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
        <h3 className="font-bold text-gray-900 mb-3">
          Tipo de Documento Tributario
        </h3>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipoDTE"
              value="boleta"
              checked={tipoDTE === "boleta"}
              onChange={() => {
                setTipoDTE("boleta");

                setCliente((prev) => {
                  const { factura, ...rest } = prev;
                  return rest;
                });
              }}
              className="accent-blue-600"
            />
            <span>Boleta</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipoDTE"
              value="factura"
              checked={tipoDTE === "factura"}
              onChange={() => {
                setTipoDTE("factura");

                setCliente((prev) => ({
                  ...prev,
                  factura: prev.factura ?? {
                    razonSocial: "",
                    giro: "",
                    calle: "",
                    numero: "",
                    complemento: "",
                    comuna: "",
                    ciudad: ""
                  }
                }));
              }}
              className="accent-blue-600"
            />
            <span>Factura</span>
          </label>
        </div>
      </div>


      {/* --- DATOS CLIENTE --- */}

      {!isAuthenticated && (
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
      )}




      {/* --- MÉTODO DE PAGO --- */}


      <div className="flex bg-gray-50 p-4 flex-col gap-4">

        <h3 className="font-bold text-gray-900 mb-3">Método de pago:</h3>

        {/* WEBPAY */}
        <button
          type="button"
          onClick={() => setMetodoPago("webpay")}
          disabled={!customerDataIsValid || giftcardCubreTodo}
          className={`group w-full bg-white/60 backdrop-blur-lg border rounded-xl p-4 shadow-md transition-all flex items-center gap-4
            ${(!customerDataIsValid || giftcardCubreTodo)
              ? "opacity-50 cursor-not-allowed"
              : metodoPago === "webpay"
                ? "border-blue-600 shadow-blue-200"
                : "border-white/30 hover:border-blue-400 hover:shadow-lg"
            }`}
        >
          <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#FF8A00]/10">
            <img
              src="/img/webpay.png"
              alt="Webpay"
              className="w-15 h-15 object-contain"
            />
          </div>

          <div className="text-left flex-1">
            <p className={`font-semibold transition
              ${metodoPago === "webpay" ? "text-blue-600" : "text-gray-900"}`}>
              Transbank Webpay
            </p>
            <p className="text-sm text-gray-600">
              Crédito, débito y prepago
            </p>
          </div>

          {metodoPago === "webpay" && (
            <CheckIcon className="w-6 h-6 text-blue-600" />
          )}
        </button>

        {/* KIPHU */}
        <button
          type="button"
          onClick={() => setMetodoPago("khipu")}
          disabled={!customerDataIsValid || giftcardCubreTodo}
          className={`group w-full bg-white/60 backdrop-blur-lg border rounded-xl p-4 shadow-md transition-all flex items-center gap-4
            ${(!customerDataIsValid || giftcardCubreTodo)
              ? "opacity-50 cursor-not-allowed"
              : metodoPago === "khipu"
                ? "border-green-600 shadow-green-200"
                : "border-white/30 hover:border-green-500 hover:shadow-lg"
            }`}
        >
          <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#00A884]/10">
            <img
              src="/img/khipu.jpg"
              alt="Khipu"
              className="w-15 h-15 object-contain"
            />
          </div>

          <div className="text-left flex-1">
            <p className={`font-semibold transition
              ${metodoPago === "khipu" ? "text-green-600" : "text-gray-900"}`}>
              Khipu Transferencias
            </p>
            <p className="text-sm text-gray-600">
              Transferencia bancaria
            </p>
          </div>

          {metodoPago === "khipu" && (
            <CheckIcon className="w-6 h-6 text-green-600" />
          )}
        </button>

      </div>
    </div>
  );
}

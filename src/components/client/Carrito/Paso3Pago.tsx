"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import { BuildingStorefrontIcon, TruckIcon } from "@heroicons/react/24/outline";
import { Sucursal } from '@/types/sucursales';
import { useState, Dispatch, SetStateAction } from 'react'

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
  payerName: string;
  payerEmail: string;
  setPayerName: Dispatch<SetStateAction<string>>;
  setPayerEmail: Dispatch<SetStateAction<string>>;
}

export default function Paso3Pago({
  deliveryType,
  selectedSucursal,
  comunaEncontrada,
  direccion,
  metodoPago,
  setMetodoPago,
  payerName,
  payerEmail,
  setPayerName,
  setPayerEmail
}: PagoProps) {

  const emailIsInvalid =
    payerEmail.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail);

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

      {/* --- MÉTODO DE PAGO --- */}
      <h3 className="font-bold text-gray-900 mb-3">Método de pago:</h3>

      <div className="flex flex-col gap-4">

        {/* WEBPAY */}
        <button
          type="button"
          onClick={() => setMetodoPago("webpay")}
          className={`group w-full bg-white/60 backdrop-blur-lg border rounded-xl p-4 shadow-md transition-all flex items-center gap-4 cursor-pointer
            ${metodoPago === "webpay"
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
          className={`group w-full bg-white/60 backdrop-blur-lg border rounded-xl p-4 shadow-md transition-all flex items-center gap-4 cursor-pointer
            ${metodoPago === "khipu"
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

          <div className="mt-6 space-y-3">
            <input
              type="text"
              placeholder="Nombre completo"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/70 border border-gray-300 focus:ring-2 focus:ring-blue-500 transition"
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={payerEmail}
              onChange={(e) => setPayerEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl bg-white/70 border transition focus:ring-2
  ${emailIsInvalid
    ? "border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:ring-blue-500"
  }`}
            />
            {emailIsInvalid && (
              <p className="text-sm text-red-600 mt-1">
                Correo electrónico inválido
              </p>
            )}
          </div>


          {metodoPago === "khipu" && (
            <CheckIcon className="w-6 h-6 text-green-600" />
          )}
        </button>

      </div>
    </div>
  );
}

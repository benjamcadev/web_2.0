"use client";

import { BuildingStorefrontIcon, TruckIcon } from "@heroicons/react/24/outline";
import { Sucursal } from '@/types/sucursales';
import {Dispatch, SetStateAction } from 'react'
import { Cliente } from '@/types/cliente'
import MetodoPago from '@/components/client/Carrito/MetodoPago'
import DatosCliente from '@/components/client/Carrito/DatosCliente'

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
  metodoPago: "webpay" | "khipu" | "credito" | null;
  setMetodoPago: (metodo: "webpay" | "khipu" | "credito" | null) => void;
  cliente: Cliente;
  setCliente: Dispatch<SetStateAction<Cliente>>;
  totalFinal: number; // total a pagar luego de aplicar giftcard (puede ser 0)
  giftcardApplied: number; // monto aplicado de giftcard (0 si no hay giftcard aplicada)
  tipoDTE: string;
  setTipoDTE: Dispatch<SetStateAction<"boleta" | "factura">>;
  direccionesCliente: any[];
  direccionSeleccionada: any | null;
  setDireccionSeleccionada: Dispatch<SetStateAction<any | null>>;
  
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
  totalFinal,
  giftcardApplied,
  tipoDTE,
  setTipoDTE,
  direccionesCliente,
  direccionSeleccionada,
  setDireccionSeleccionada,
  
}: PagoProps) {


  const emailIsInvalid =
    cliente.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email);

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

      <DatosCliente
        tipoDTE={tipoDTE}
        cliente={cliente}
        setCliente={setCliente}
        emailIsInvalid={emailIsInvalid}
        direccionesCliente={direccionesCliente}
        direccionSeleccionada={direccionSeleccionada}
        setDireccionSeleccionada={setDireccionSeleccionada}
      />

      {/* --- MÉTODO DE PAGO --- */}

      <MetodoPago
        emailIsInvalid={emailIsInvalid}
        cliente={cliente}
        tipoDTE={tipoDTE}
        giftcardApplied={giftcardApplied}
        totalFinal={totalFinal}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
      />

    </div>
  );
}

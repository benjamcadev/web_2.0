"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CreditCard } from "lucide-react";
import Header from "@/components/client/Header/Header";
import { useCart } from "@/hooks/useCart";
import { useEffect } from "react";

export default function PagoCreditoSuccessPage() {
  const searchParams = useSearchParams();
  const pedidoNumero = searchParams.get("pedido");
  const pedidoId = searchParams.get("pedidoId");
  const razonSocial = searchParams.get("razonSocial");
  const cupoRestante = searchParams.get("cupoRestante");
  const cupoUsado = searchParams.get("cupoUsado");
  const cupoTotal = searchParams.get("cupoTotal");
  const fecha = searchParams.get("fecha");
  const { clearCartSuccess } = useCart();

  useEffect(() => {
       clearCartSuccess();
    },[])
    
  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 ml-3 mr-3 px-4">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur-lg border border-white/40 rounded-2xl shadow-xl p-8 text-center">

          {/* Icono */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle2 className="w-16 h-16 text-indigo-600" />
              <CreditCard className="w-6 h-6 text-indigo-500 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
            ¡Compra realizada con éxito!
          </h1>

          {/* Subtítulo */}
          <p className="text-gray-700 mb-6">
            Tu compra fue cargada correctamente a tu{" "}
            <span className="font-semibold text-indigo-700">
              Crédito Interno
            </span>.
          </p>

          {/* Pedido */}
          {pedidoNumero && (
            <div className="bg-indigo-100/70 border border-indigo-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                Número de pedido
              </p>
              <p className="text-2xl font-bold text-indigo-800 break-all">
                {pedidoNumero}
              </p>
            </div>
          )}

          {/* Resumen de compra */}
          {(razonSocial || cupoRestante || fecha) && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 mb-6 text-left space-y-2">
              <h2 className="text-sm font-semibold text-purple-700 mb-1">
                Resumen de compra
              </h2>

               {pedidoId && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Codigo Pedido:</span>{" "}
                  {pedidoId}
                </p>
              )}

             
              {razonSocial && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Razón social:</span>{" "}
                  {razonSocial}
                </p>
              )}

              {fecha && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Fecha de compra:</span>{" "}
                  {fecha}
                </p>
              )}

             

              {(cupoRestante && cupoTotal) && (() => {
                const restante = Number(cupoRestante);
                const cupo_usado = Number(cupoUsado);
                const total = Number(cupoTotal);
                const usado = total - restante;
                const porcentajeUsado = Math.min(100, Math.round((usado / total) * 100));

                return (
                  <>
                  
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Cupo restante:</span>{" "}
                      <span className="font-bold text-green-700">
                        ${restante.toLocaleString("es-CL")}
                      </span>
                    </p>

                      <p className="text-sm text-gray-700">
                      <span className="font-medium">Cupo usado en esta compra:</span>{" "}
                      <span className="font-bold text-gray-700">
                        ${cupo_usado.toLocaleString("es-CL")}
                      </span>
                    </p>


                    {/* Barra de cupo */}
                    <div className="mt-2">
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-3 bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-700"
                          style={{ width: `${porcentajeUsado}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Usado: ${usado.toLocaleString("es-CL")} de ${total.toLocaleString("es-CL")} ({porcentajeUsado}%)
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Mensaje */}
          <p className="text-sm text-gray-600 mb-8">
            Hemos registrado tu pedido correctamente.
            Este monto fue descontado de tu cupo de crédito disponible.
            En breve recibirás un correo con el detalle de la compra.
          </p>

          {/* Acciones */}
          <div className="space-y-3">
            <Link
              href="/tienda"
              className="block w-full bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-400 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Seguir comprando
            </Link>

            <Link
              href="/"
              className="block text-center text-gray-600 hover:text-gray-800 text-sm"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
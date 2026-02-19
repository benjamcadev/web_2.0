"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/client/Header/Header";
import { useState } from "react";
import toast from "react-hot-toast";
import SuccessToast from "@/components/UI/SuccessToast";
import ErrorToast from '@/components/UI/ErrorToast'

export default function WebpayConfirmacion() {
  const router = useRouter();
  const params = useSearchParams();

  const encodedData = params.get("data");
  const data = encodedData ? JSON.parse(decodeURIComponent(encodedData)) : null;


  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No se encontró información del pago.</p>
      </div>
    );
  }

  const isSuccess = data.status === "AUTHORIZED";

  const paymentTypeMap: Record<string, string> = {
    VN: "Crédito - Venta Normal",
    VC: "Crédito - Cuotas",
    SI: "Crédito - 3 cuotas sin interés",
    S2: "Crédito - 2 cuotas sin interés",
    VP: "Débito",
  };

  const paymentTypeLabel = paymentTypeMap[data.webpay.payment_type_code] ?? "Desconocido";

  // -------------------------------------------------------
  //  Handler para enviar comprobante al correo
  // -------------------------------------------------------
  const handleEnviarComprobante = async () => {
    if (!email || !email.includes("@")) {
     
      toast.custom(
        <ErrorToast subtitle={``} title={'Ingresa un correo válido'} />,
        {
          duration: 5000,
          position: "bottom-center",
          icon: null,
          style: { background: "transparent", boxShadow: "none", padding: 0 },
        }
      );
      return;
    }

    setSending(true);

    try {

      const res = await fetch("/api/pagos/webpay/enviar-comprobante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, data }),
      });

      if (!res.ok) {
       
         toast.custom(
        <ErrorToast subtitle={``} title={'No se pudo enviar el comprobante'} />,
        {
          duration: 5000,
          position: "bottom-center",
          icon: null,
          style: { background: "transparent", boxShadow: "none", padding: 0 },
        }
      );
        return;
      }

      toast.custom(
        <SuccessToast subtitle={''} title={'Comprobante enviado correctamente'} />,
        {
          duration: 2400,
          position: "bottom-center",
          icon: null,
          style: { background: "transparent", boxShadow: "none", padding: 0 },
        }
      );


    } catch (error) {
        toast.custom(
        <ErrorToast subtitle={``} title={'No se pudo enviar el comprobante'} />,
        {
          duration: 5000,
          position: "bottom-center",
          icon: null,
          style: { background: "transparent", boxShadow: "none", padding: 0 },
        }
      );
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header />

      <div className="flex flex-col md:items-center md:flex-row mt-6 px-6 gap-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 ml-3 mr-3">
        <div className="min-h-screen w-full flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-200">

            {/* ==== ICONO + TITULO ==== */}
            <div className="text-center">
              <div
                className={`mx-auto h-16 w-16 rounded-full ${isSuccess ? "bg-green-100" : "bg-red-100"
                  } flex items-center justify-center mb-4`}
              >
                <svg
                  className={`h-10 w-10 ${isSuccess ? "text-green-600" : "text-red-600"
                    }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  {isSuccess ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a10 10 0 11-20 0 10 10 0 0120 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3m0 4h.01M21.21 15.89A10 10 0 1112 2a10 10 0 019.21 13.89z"
                    />
                  )}
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isSuccess ? "¡Pago exitoso!" : "Pago rechazado"}
              </h1>

              <p className="text-gray-600 mb-6">
                {isSuccess
                  ? "Tu transacción fue autorizada correctamente."
                  : "La transacción no pudo completarse."}
              </p>
            </div>

            {/* ==== DETALLES ==== */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Detalles del pago
              </h2>

              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Orden de compra:</span> {data.webpay.buy_order}</p>
                <p><span className="font-semibold">Codigo de Autorización:</span> {data.webpay.authorization_code}</p>
                <p><span className="font-semibold">Monto pagado:</span> ${data.webpay.amount?.toLocaleString("es-CL")}</p>
                <p><span className="font-semibold">Fecha:</span> {new Date(data.webpay.transaction_date).toLocaleString("es-CL")}</p>
                <p><span className="font-semibold">Método:</span> {paymentTypeLabel}</p>
                <p><span className="font-semibold">Tarjeta:</span> **** **** **** {data.webpay.card_detail?.card_number ?? "N/A"}</p>

                {data.authorization_code && (
                  <p>
                    <span className="font-semibold">Código de autorización:</span>{" "}
                    {data.webpay.authorization_code}
                  </p>
                )}

                <p>
                  <span className="font-semibold">Estado:</span>{" "}
                  {data.webpay.status}
                </p>
              </div>
            </div>



            {/* === DETALLE DEL PEDIDO === */}
              
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-left mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                      Detalle del pedido
                    </h2>

                    <div className="space-y-2 text-gray-700">
                      <p>
                        <span className="font-semibold">Número de pedido:</span>{" "}
                        {data.pedido.numero_pedido}
                      </p>

                      <p>
                        <span className="font-semibold">Estado:</span>{" "}
                        {data.pedido.estado}
                      </p>

                      <p>
                        <span className="font-semibold">Total:</span>{" "}
                        ${data.pedido.total?.toLocaleString("es-CL")}
                      </p>

                      <p>
                        <span className="font-semibold">Tipo de entrega:</span>{" "}
                        {data.pedido.tipo_delivery === "retiro"
                          ? "Retiro en tienda"
                          : "Envío a domicilio"}
                      </p>

                      <p>
                        <span className="font-semibold">Sucursal:</span>{" "}
                        {data.pedido.sucursal}
                      </p>

                      {data.pedido.tipo_delivery === "envio" && (
                        <>
                          <p>
                            <span className="font-semibold">Comuna:</span>{" "}
                            {data.pedido.comuna_envio}
                          </p>

                          <p>
                            <span className="font-semibold">Dirección:</span>{" "}
                            {data.pedido.direccion_envio}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                

            {/* ============================================================
                📩 FORMULARIO PARA ENVIAR COMPROBANTE POR EMAIL
               ============================================================ */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Enviar comprobante por correo
              </h2>

              <input
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />

              <button
                disabled={sending}
                onClick={handleEnviarComprobante}
                className="w-full bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"

              >
                {sending ? "Enviando..." : "Enviar comprobante"}
              </button>
            </div>

            {/* ==== BOTONES DE NAVEGACIÓN ==== */}
            <button
              onClick={() => router.push("/tienda")}
              className="w-full bg-gradient-to-br from-green-600 via-green-500 to-emerald-400 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Seguir comprando
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full py-3 px-4 mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl hover:scale-105 transition-all duration-300"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

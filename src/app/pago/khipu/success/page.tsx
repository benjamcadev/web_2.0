"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/client/Header/Header";
import SuccessToast from "@/components/UI/SuccessToast";
import ErrorToast from '@/components/UI/ErrorToast'
import { useCart } from "@/hooks/useCart";

interface DetallePedido {
  numero_pedido: string;
  estado: string;
  total: number;
  tipo_delivery: "retiro" | "envio";
  sucursal: string;
  comuna_envio?: string;
  direccion_envio?: string;
}

interface DetallePago {
  payment_id: string;
  transaction_id: string;
  amount: string;
  payer_name: string;
  payer_email: string;
  payment_method: string;
  conciliation_date: string;
  receipt_url: string;
}


export default function KhipuSuccess() {
  const params = useSearchParams();
  const router = useRouter();
  const { clearCartSuccess } = useCart();

  const pagoId = params.get("np"); // numero_pago en strapi
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [validarExterno, setValidarExterno] = useState(false)

  const [estado, setEstado] = useState<
    "validando" | "validando_khipu" | "ok" | "failed"
  >("validando");

  const [detalle, setDetalle] = useState<DetallePago>();
  const [pedido, setPedido] = useState<DetallePedido>();

  // === Email comprobante state ===
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  // Verificar webhook + Strapi
  useEffect(() => {
    if (!pagoId) return;

    let attempts = 0;
    const maxAttempts = 40; // 40 intentos x 3s ≈ 120s

    const interval = setInterval(async () => {
      attempts++;

      const res = await fetch(`/api/pagos/khipu/estado?pagoId=${pagoId}`);
      const data = await res.json();

      if (data.ok && data.pagado) {
        setEstado("ok");
        setDetalle(data.detalle);
        setPedido(data.pedido)
        setEstado("validando_khipu");
        setPaymentId(data.payment_id)
        clearInterval(interval);
        setValidarExterno(true)
      }

      // Si llega al límite → marcar como fallido (o "pendiente largo")
      if (attempts >= maxAttempts) {
        //setEstado("failed");
        console.log("Intentos maximos alcanzados")
        clearInterval(interval);
        setValidarExterno(true)
        setEstado("validando_khipu");
        setPaymentId(data.payment_id)
        return;
      }

    }, 3000);

    return () => clearInterval(interval);
  }, [pagoId]);

  // 2) Validación contra los servidores oficiales de Khipu
  useEffect(() => {
    if (estado !== "validando_khipu") return;
    if (!paymentId) return;

    const validarExterno = async () => {
      try {
        const res = await fetch(
          `/api/pagos/khipu/validacion?payment_id=${paymentId}`
        );
        const data = await res.json();

        if (data.ok && data.pagado === true) {
          setEstado("ok");
          setDetalle(data.detalle);
           clearCartSuccess();
          return;
        }

        if (data.ok && data.pagado === false) {
          setEstado("failed");
          return;
        }

        // Si sigue pending, seguimos revisando cada 3 seg
        setTimeout(validarExterno, 3000);
      } catch (e) {
        console.error(e);
      }
    };

    validarExterno();
  }, [validarExterno]);

  // === Handler para enviar comprobante por correo ===
  const handleEnviarComprobante = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Ingresa un correo válido");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/pagos/khipu/enviar-comprobante", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, detalle, pedido }),
      });

      if (!res.ok) throw new Error("Error enviando correo");
      toast.custom(
        <SuccessToast subtitle={''} title={'Comprobante enviado correctamente'} />,
        {
          duration: 2400,
          position: "bottom-center",
          icon: null,
          style: { background: "transparent", boxShadow: "none", padding: 0 },
        }
      );
    } catch (e) {
       toast.custom(
        <ErrorToast subtitle={``} title={'No se pudo enviar el comprobante'} />,
        {
          duration: 5000,
          position: "bottom-center",
          icon: null,
          style: { background: "transparent", boxShadow: "none", padding: 0 },
        }
      );
    } finally {
      setSending(false);
    }
  };

  // Render según estado
  const isSuccess = estado === "ok";

  return (
    <>
      <Header />

      <div className="flex flex-col mt-6 px-6 gap-6 rounded-2xl bg-white/50 backdrop-blur-lg border border-white/30 mx-3">
        <div className="min-h-screen w-full flex items-center justify-center px-4">
          <div className="max-w-lg w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-200 text-center">

            {estado === "validando" && (
              <div>
                <Spinner />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Validando pago...</h1>
                <p className="text-gray-600">Esperando confirmación no cierres esta ventana.</p>
              </div>
            )}

            {estado === "validando_khipu" && (
              <div>
                <Spinner />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Verificando pago con servidores Khipu...
                </h1>
                <p className="text-gray-600">Esto puede tardar unos segundos más.</p>
              </div>
            )}

            {estado !== "validando" && estado !== "validando_khipu" && (
              <>
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a10 10 0 11-20 0 10 10 0 0120 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21.21 15.89A10 10 0 1112 2a10 10 0 019.21 13.89z" />
                    )}
                  </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {isSuccess ? "¡Pago confirmado!" : "Pago aun no confirmado"}
                </h1>

                <p className="text-gray-600 mb-6">
                  {isSuccess
                    ?  "Tu pago fue recibido con éxito."
                    : "No pudimos confirmar tu pago. Pero Khipu te enviara un correo con un comprobante cuando se valide el pago. Te sugerimos guardar el comprobante"}
                </p>

                {/* === DETALLES DEL PAGO (SOLO SI ÉXITO) === */}
                {isSuccess && detalle && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-left mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                      Detalles del pago
                    </h2>

                    <div className="space-y-2 text-gray-700">

                      {detalle.payment_id && (
                        <p>
                          <span className="font-semibold">ID de pago:</span> {detalle.payment_id}
                        </p>
                      )}

                      {detalle.transaction_id && (
                        <p>
                          <span className="font-semibold">Transacción:</span> {detalle.transaction_id}
                        </p>
                      )}

                      {detalle.amount && (
                        <p>
                          <span className="font-semibold">Monto:</span> ${parseInt(detalle.amount).toLocaleString("es-CL")}
                        </p>
                      )}

                      {detalle.payer_name && (
                        <p>
                          <span className="font-semibold">Pagador:</span> {detalle.payer_name}
                        </p>
                      )}

                      {detalle.payer_email && (
                        <p>
                          <span className="font-semibold">Correo:</span> {detalle.payer_email}
                        </p>
                      )}

                      {detalle.payment_method && (
                        <p>
                          <span className="font-semibold">Método:</span> {detalle.payment_method.replace("_", " ")}
                        </p>
                      )}

                      {detalle.conciliation_date && (
                        <p>
                          <span className="font-semibold">Fecha conciliación:</span>{" "}
                          {new Date(detalle.conciliation_date).toLocaleString("es-CL")}
                        </p>
                      )}

                      {detalle.receipt_url && (
                        <a
                          href={detalle.receipt_url}
                          target="_blank"
                          className="inline-block mt-3 text-blue-600 hover:underline font-semibold"
                        >
                          Ver comprobante PDF
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* === DETALLE DEL PEDIDO === */}
                {isSuccess && pedido && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-left mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                      Detalle del pedido
                    </h2>

                    <div className="space-y-2 text-gray-700">
                      <p>
                        <span className="font-semibold">Número de pedido:</span>{" "}
                        {pedido.numero_pedido}
                      </p>

                      <p>
                        <span className="font-semibold">Estado:</span>{" "}
                        {pedido.estado}
                      </p>

                      <p>
                        <span className="font-semibold">Total:</span>{" "}
                        ${pedido.total?.toLocaleString("es-CL")}
                      </p>

                      <p>
                        <span className="font-semibold">Tipo de entrega:</span>{" "}
                        {pedido.tipo_delivery === "retiro"
                          ? "Retiro en tienda"
                          : "Envío a domicilio"}
                      </p>

                      <p>
                        <span className="font-semibold">Sucursal:</span>{" "}
                        {pedido.sucursal}
                      </p>

                      {pedido.tipo_delivery === "envio" && (
                        <>
                          <p>
                            <span className="font-semibold">Comuna:</span>{" "}
                            {pedido.comuna_envio}
                          </p>

                          <p>
                            <span className="font-semibold">Dirección:</span>{" "}
                            {pedido.direccion_envio}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* === ENVIAR COMPROBANTE POR CORREO === */}
                {isSuccess && (
                  <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6 text-left">
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
                      className="w-full bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
                    >
                      {sending ? "Enviando..." : "Enviar comprobante"}
                    </button>
                  </div>
                )}

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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Spinner() {
  return (
    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 animate-pulse mx-auto">
      <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
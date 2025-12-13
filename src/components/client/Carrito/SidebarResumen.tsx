import Link from "next/link";
import { formatCLP } from "@/lib/formatCLP";
import { Sucursal } from "@/types/sucursales";
import { CartItem } from "@/types/cart";
import { Producto } from '@/types/producto';
import { validarCarritoAntesDePagar } from "@/lib/validarCarrito";
import toast from "react-hot-toast";
import ErrorToast from '@/components/UI/ErrorToast'
import LoadingToast from '@/components/UI/LoadingToast'
import { getSessionId } from '@/lib/stockReservationService'
import { useState } from "react";

type DeliveryType = "retiro" | "envio" | null;

interface Props {
  currentStep: number;
  totalItems: number;
  totalPrice: number;
  deliveryType: DeliveryType;
  costoEnvio: number;
  totalConEnvio: number;
  canProceedToStep3: boolean | Sucursal | null;
  setCurrentStep: (step: number) => void;
  setIsModalOpen: (open: boolean) => void;
  items: CartItem[];
  metodoPago: "webpay" | "khipu" | null;
  payerName: string;
  payerEmail: string;
  direccion: string | "";
  comuna: string | "";
  sucursal: string | "";
}

export default function SidebarResumen({
  currentStep,
  totalItems,
  totalPrice,
  deliveryType,
  costoEnvio,
  totalConEnvio,
  canProceedToStep3,
  setCurrentStep,
  setIsModalOpen,
  items,
  metodoPago,
  payerName,
  payerEmail,
  direccion,
  comuna,
  sucursal
}: Props) {

  // Giftcard state
  const [giftcardCode, setGiftcardCode] = useState("");
  const [giftcardBalance, setGiftcardBalance] = useState<number | null>(null);
  const [giftcardApplied, setGiftcardApplied] = useState<number>(0);
  const [giftcardLoading, setGiftcardLoading] = useState(false);

  const totalFinal = Math.max(totalConEnvio - giftcardApplied, 0);

  const handleValidateGiftcard = async () => {
    if (!giftcardCode) return;

    setGiftcardLoading(true);
    try {
      const res = await fetch("/api/pagos/giftcard/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: giftcardCode,
          orderTotal: totalConEnvio,
        }),
      });

      const data = await res.json();

      if (!data.valid) {
        setGiftcardBalance(null);
        setGiftcardApplied(0);
        toast.error("Giftcard inválida o sin saldo");
        return;
      }

      setGiftcardBalance(data.balance);
      // Aplicar automáticamente la giftcard
      const applied = Math.min(data.balance, totalConEnvio);
      setGiftcardApplied(applied);
      toast.success("Giftcard válida");
    } catch (e) {
      toast.error("Error al validar giftcard");
    } finally {
      setGiftcardLoading(false);
    }
  };

  const handleApplyGiftcard = () => {
    if (!giftcardBalance) return;
    const applied = Math.min(giftcardBalance, totalConEnvio);
    setGiftcardApplied(applied);
  };

  const handleRemoveGiftcard = () => {
    setGiftcardApplied(0);
    setGiftcardBalance(null);
    setGiftcardCode("");
  };

  const handlePago = async () => {
    // Validar stock y reservas

    const loadingToastId = toast.custom(
      <LoadingToast
        title="Validando productos..."
        subtitle="Por favor espera un momento."
      />,
      {
        duration: Infinity,
        position: "bottom-center",
        icon: null,
        style: { background: "transparent", boxShadow: "none", padding: 0 },
      }
    );

    try {
      const result = await validarCarritoAntesDePagar({ items });

      toast.dismiss(loadingToastId);

      if (!result.ok) {
        toast.custom(
          <ErrorToast
            title="Productos sin stock"
            subtitle={
              <ul className="list-disc ml-5 mt-1">
                {result.resultados
                  .filter((p: { estado: string; }) => p.estado !== "ok")
                  .map((producto: Producto) => (
                    <li key={producto.id}>{producto.name}</li>
                  ))}
              </ul>
            }
          />,
          {
            duration: 6000,
            position: "bottom-center",
            icon: null,
            style: { background: "transparent", boxShadow: "none", padding: 0 },
          }
        );


        return;
      }

      // Crear Pedido en Strapi antes del pago
      const pedidoRes = await fetch("/api/pedido/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total: totalConEnvio,
          metodoPago,
          payerName,
          payerEmail,
          deliveryType,
          direccion,
          comuna,
          sucursal,
          giftcardCode,
          giftcardApplied

        }),
      });

      const pedidoData = await pedidoRes.json();


      if (!pedidoData.ok) {

        toast.custom(
          <ErrorToast
            title="Error"
            subtitle={"Error al crear el pedido antes del pago."}
          />,
          {
            duration: 6000,
            position: "bottom-center",
            icon: null,
            style: { background: "transparent", boxShadow: "none", padding: 0 },
          }
        );
        return;
      }

      const pedidoId = pedidoData.pedidoId;
      const pagoId = pedidoData.pagoId;
      const numeroPago = pedidoData.numeroPago;
      const numeroPedido = pedidoData.numeroPedido;


      const sessionId = getSessionId();

      //Metodo pago Khipu
      if (metodoPago === "khipu") {
        const isEmailValid =
          payerEmail.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail);

        if (!payerName || !payerEmail || !isEmailValid) {
          toast.custom(
            <ErrorToast
              title='Error'
              subtitle={'Debes ingresar nombre y correo valido antes de continuar con el pago.'}
            />,
            {
              duration: 6000,
              position: "bottom-center",
              icon: null,
              style: { background: "transparent", boxShadow: "none", padding: 0 },
            }
          );
          return;
        }

        const res = await fetch("/api/pagos/khipu/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalFinal,
            payerName,
            payerEmail,
            transactionId: `KHP-${Date.now()}`,
            pagoId,
            numeroPago,
            sessionId,
          })
        });

        const data = await res.json();

        if (!data.ok) {
           toast.custom(
            <ErrorToast
              title='Error'
              subtitle={'Error al iniciar pago con Khipu.'}
            />,
            {
              duration: 6000,
              position: "bottom-center",
              icon: null,
              style: { background: "transparent", boxShadow: "none", padding: 0 },
            }
          );
          return;
        }
        const loadingToastKhipu = toast.custom(
          <LoadingToast
            title="Redirigiendo a Khipu..."
            subtitle="Por favor espera un momento."
          />,
          {
            duration: Infinity,
            position: "bottom-center",
            icon: null,
            style: { background: "transparent", boxShadow: "none", padding: 0 },
          }
        );
        // Redirigir al usuario al formulario de pago de Webpay

        setTimeout(() => {
          toast.dismiss(loadingToastKhipu);
          // Redirigir al checkout khipu
          window.location.href = data.payment.payment_url + "?redirect-after=" + data.return_url + "?payment_id=" + data.payment.payment_id;
        }, 2500);

      }


      // Crear pago con webpay
      if (metodoPago === "webpay") {
        const body = {
          amount: totalFinal, // total del carrito
          buyOrder: `ORD-${Date.now()}`,
          sessionId: sessionId,
          pagoId
        };

        const res = await fetch("/api/pagos/webpay/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!data.ok) {
          toast.custom(
            <ErrorToast
              title="Error al iniciar pago con WebPay"
              subtitle="Ocurrió un problema al iniciar el pago."
            />,
            {
              duration: 6000,
              position: "bottom-center",
              icon: null,
              style: { background: "transparent", boxShadow: "none", padding: 0 },
            }
          );
          return;
        }

        const loadingToastWebPay = toast.custom(
          <LoadingToast
            title="Redirigiendo a Webpay..."
            subtitle="Por favor espera un momento."
          />,
          {
            duration: Infinity,
            position: "bottom-center",
            icon: null,
            style: { background: "transparent", boxShadow: "none", padding: 0 },
          }
        );
        // Redirigir al usuario al formulario de pago de Webpay

        setTimeout(() => {
          toast.dismiss(loadingToastWebPay);
          window.location.href = `${data.url}?token_ws=${data.token}`;
        }, 2500);

      }


    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToastId);

      toast.custom(
        <ErrorToast
          title="Error inesperado"
          subtitle="Ocurrió un problema al iniciar el pago."
        />,
        {
          duration: 6000,
          position: "bottom-center",
          icon: null,
          style: { background: "transparent", boxShadow: "none", padding: 0 },
        }
      );
    }
  }
  return (
    <div className="bg-white/60 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-lg sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del pedido</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal ({totalItems} productos)</span>
          <span className="font-medium">{formatCLP(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Envío</span>
          <span className="font-medium">
            {deliveryType === "retiro" ? (
              <span className="text-green-600 font-bold">GRATIS</span>
            ) : costoEnvio > 0 ? (
              formatCLP(costoEnvio)
            ) : (
              "A calcular"
            )}
          </span>
        </div>
        {/* Giftcard */}
        <div className="border-t border-gray-300 pt-3 space-y-2">
          <span className="font-semibold text-gray-800">Giftcard</span>

          {!giftcardBalance && (
            <div className="flex gap-2">
              <input
                type="text"
                value={giftcardCode}
                onChange={(e) => setGiftcardCode(e.target.value)}
                placeholder="Código giftcard"
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={handleValidateGiftcard}
                disabled={giftcardLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {giftcardLoading ? "Validando..." : "Validar"}
              </button>
            </div>
          )}

          {giftcardBalance !== null && giftcardApplied > 0 && (
            <div className="flex justify-between items-center text-sm text-green-700">
              <span>Saldo disponible</span>
              <span>{formatCLP(giftcardBalance)}</span>
            </div>
          )}

          {giftcardApplied > 0 && (
            <div className="flex justify-between items-center text-sm text-green-700">
              <span>Giftcard aplicada</span>
              <span>-{formatCLP(giftcardApplied)}</span>
              <button
                onClick={handleRemoveGiftcard}
                className="text-red-600 text-xs ml-2 hover:underline"
              >
                Quitar
              </button>
            </div>
          )}
        </div>
        <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span>{formatCLP(totalFinal)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {currentStep === 1 && (
          <button
            onClick={() => setCurrentStep(2)}
            className="w-full bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Continuar a Envío →
          </button>
        )}

        {currentStep === 2 && (
          <>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!canProceedToStep3}
              className={`w-full font-bold py-3 rounded-xl transition-all duration-300 ${canProceedToStep3
                ? 'bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-400 text-white hover:shadow-lg hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {!deliveryType
                ? "Selecciona método de entrega"
                : !canProceedToStep3
                  ? "Completa los datos"
                  : "Continuar a Pago →"
              }
            </button>
            <button
              onClick={() => setCurrentStep(1)}
              className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-all"
            >
              ← Volver al carrito
            </button>
          </>
        )}

        {currentStep === 3 && (
          <>
            <button
              disabled={!metodoPago}
              className={`w-full font-bold py-3 rounded-xl transition-all duration-300 ${metodoPago
                ? "bg-gradient-to-br from-green-600 via-green-500 to-emerald-400 text-white hover:shadow-lg hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              onClick={handlePago}
            >
              {metodoPago ? `Pagar ${formatCLP(totalFinal)}` : "Selecciona un método de pago"}
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-all"
            >
              ← Volver a Envío
            </button>
          </>
        )}

        {/* Solo mostrar botón de cotización en paso 1 */}
        {currentStep === 1 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-br from-purple-600 via-purple-500 to-pink-400 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            Generar Cotización Formal
          </button>
        )}

        <Link
          href="/tienda"
          className="block text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          ← Seguir comprando
        </Link>
      </div>
    </div>
  );
}
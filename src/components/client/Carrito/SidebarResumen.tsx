import Link from "next/link";
import { formatCLP } from "@/lib/formatCLP";
import { Sucursal } from "@/types/sucursales";
import { CartItem } from "@/types/cart";
import { Producto } from '@/types/producto';
import { validarStockCarrito } from "@/lib/validarCarrito";
import { validarPrecioCarrito } from "@/lib/validarPrecioCarrito";
import toast from "react-hot-toast";
import ErrorToast from '@/components/UI/ErrorToast'
import SuccessToast from "@/components/UI/SuccessToast";
import LoadingToast from '@/components/UI/LoadingToast';
import PriceChangeToast from '@/components/UI/PriceChangeToast';
import { getSessionId } from '@/lib/stockReservationService';
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Cliente } from '@/types/cliente';
import { validateRut } from "@/lib/validateRut";
import { useCart } from "@/hooks/useCart";

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
  metodoPago: "webpay" | "khipu" | "credito" | null;
  cliente: Cliente;
  direccion: string | "";
  comuna: string | "";
  sucursal: string | "";
  giftcardApplied: number;
  giftcardCode: string;
  giftcardBalance: number | 0;
  giftcardLoading: boolean;
  setGiftcardBalance: Dispatch<SetStateAction<number | null>>;
  setGiftcardApplied: Dispatch<SetStateAction<number>>;
  setGiftcardCode: Dispatch<SetStateAction<string>>;
  setGiftcardLoading: Dispatch<SetStateAction<boolean>>;
  tipoDTE: "boleta" | "factura";
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
  cliente,
  direccion,
  comuna,
  sucursal,
  giftcardApplied,
  giftcardCode,
  setGiftcardLoading,
  setGiftcardBalance,
  setGiftcardApplied,
  setGiftcardCode,
  giftcardBalance,
  giftcardLoading,
  tipoDTE,
}: Props) {

  const [showGiftcard, setShowGiftcard] = useState(false);
  // Obtenemos updatePrice del hook cel carrito para actualizar precio en caso de cambios
  const { updatePrice } = useCart();

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
        let subtitle = "Giftcard inválida o expirada";
        if (data.reason === "SIN_SALDO") subtitle = "Giftcard sin saldo disponible";
        toast.custom(
          <ErrorToast
            title='Error' subtitle={subtitle} />,
          { duration: 6000, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 }, }
        );
        return;
      }

      setGiftcardBalance(data.balance);
      // Aplicar automáticamente la giftcard
      const applied = Math.min(data.balance, totalConEnvio);
      setGiftcardApplied(applied);
      toast.custom(
        <SuccessToast subtitle={''} title={'Giftcard válida'} />,
        { duration: 2400, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 }, }
      );
    } catch (e) {
      toast.custom(
        <ErrorToast
          title='Error'
          subtitle={'Error al validar giftcard'}
        />,
        { duration: 6000, position: "bottom-center", icon: null, style: { background: "transparent", boxShadow: "none", padding: 0 }, }
      );
    } finally {
      setGiftcardLoading(false);
    }
  };


  const handleRemoveGiftcard = () => {
    setGiftcardApplied(0);
    setGiftcardBalance(null);
    setGiftcardCode("");
  };

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

  const [legalPdfUrl, setLegalPdfUrl] = useState<string | null>(null);
  const [privacyPdfUrl, setPrivacyPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadLegalPdf = async () => {
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/configuracions?populate=*`,
          { cache: "no-store" }
        );
        const json = await res.json();

        const legalUrl =
          Array.isArray(json?.data) && json.data.length > 0
            ? json.data[0]?.terminos_condiciones_pdf?.url
            : null;

        const privacyUrl =
          Array.isArray(json?.data) && json.data.length > 0
            ? json.data[0]?.politica_privacidad_pdf?.url
            : null;

        setLegalPdfUrl(legalUrl ?? null);
        setPrivacyPdfUrl(privacyUrl ?? null);
      } catch (error) {
        console.error("Error cargando PDF de términos y condiciones", error);
      }
    };

    loadLegalPdf();
  }, [STRAPI_URL]);

  const handlePago = async () => {
    //obtener sesion
    const sessionId = getSessionId();

    // validar email
    const isEmailValid = cliente.email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email);

    // validar campos base (boleta vs factura)
    if (
      !cliente.email ||
      !validateRut(cliente.rut) ||
      !cliente.telefono ||
      !isEmailValid ||
      (tipoDTE === "boleta" && !cliente.nombre) ||
      (tipoDTE === "factura" && !cliente.factura?.razonSocial) || (tipoDTE === "factura" && !cliente.factura?.giro) ||
      (tipoDTE === "factura" && !cliente.factura?.calle) || (tipoDTE === "factura" && !cliente.factura?.numero) ||
      (tipoDTE === "factura" && !cliente.factura?.comuna) || (tipoDTE === "factura" && !cliente.factura?.ciudad)
    ) {
      toast.custom(
        <ErrorToast
          title="Error"
          subtitle={
            tipoDTE === "boleta"
              ? "Debes ingresar los campos requeridos con * antes de continuar con el pago."
              : "Debes ingresar los campos requeridos con * antes de continuar con el pago."
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

    // Validar datos de factura SOLO si aplica
    if (tipoDTE === "factura") {
      const factura = cliente.factura;

      if (
        !factura ||
        !factura.razonSocial ||
        !factura.giro ||
        !factura.calle ||
        !factura.numero ||
        !factura.comuna
      ) {
        toast.custom(
          <ErrorToast
            title="Datos de Factura incompletos"
            subtitle="Debes completar razón social, giro y dirección tributaria para emitir factura."
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
    }


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

      // VALIDAR STOCK Y RESERVAS DE STOCK DE CADA PRODUCTO
      const result = await validarStockCarrito({ items });

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

      // 2. Validar Precios (NUEVO)
      const precioRes = await validarPrecioCarrito({ items });

      if (!precioRes.ok) {
        toast.custom((t) => (
          <PriceChangeToast
            t={t}
            discrepancias={precioRes.discrepancias}
            onConfirm={() => {
              // Actualizamos cada ítem con el precio nuevo
              precioRes.discrepancias.forEach((d: any) => {
                if (d.tipo === 'cambio_precio') {
                  updatePrice(d.id, d.precio_real);
                }
              });
              // Opcional: Recargar página o simplemente dejar que React actualice la UI
            }}
          />
        ), { duration: Infinity }); // Importante: Infinity para obligar acción
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
          tipoDTE,
          cliente,
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


      // Pago con Crédito Interno
      if (metodoPago === "credito") {
        const loadingToastCredito = toast.custom(
          <LoadingToast
            title="Procesando crédito interno..."
            subtitle="Por favor espera un momento."
          />,
          {
            duration: Infinity,
            position: "bottom-center",
            icon: null,
            style: { background: "transparent", boxShadow: "none", padding: 0 },
          }
        );

        const confirmRes = await fetch("/api/pagos/credito/confirmar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pedidoId,
            pagoId,
            numeroPago,
            cliente,
            amount: totalFinal,
            numeroPedido,
            deliveryType,
            sucursal,
            direccion,
            comuna,
            cupoTotal: cliente.cupo_total,
            giftcardCode,
            giftcardApplied,
            sessionId
          }),
        });

        const confirmData = await confirmRes.json();

        toast.dismiss(loadingToastCredito);

        if (!confirmRes.ok || !confirmData.success) {
          let message = confirmData.message ?? ''
          toast.custom(
            <ErrorToast
              title="Error"
              subtitle={`No se pudo confirmar el pago con crédito interno. Detalle: ${message}`}
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

        const loadingToastCreditoFinal = toast.custom(
          <LoadingToast
            title="Confirmando pedido..."
            subtitle="Por favor espera un momento."
          />,
          {
            duration: Infinity,
            position: "bottom-center",
            icon: null,
            style: { background: "transparent", boxShadow: "none", padding: 0 },
          }
        );

        setTimeout(() => {
          toast.dismiss(loadingToastCreditoFinal);
          window.location.href = `/pago/credito/success?pedido=${numeroPedido}&pedidoId=${confirmData.pedidoId}&razonSocial=${cliente.factura?.razonSocial}&cupoRestante=${confirmData.cupoRestante}&cupoUsado=${confirmData.cupoUsado}&cupoTotal=${cliente.cupo_total}&fecha=${new Date().toLocaleDateString("es-CL")}`;
        }, 2500);

        return;
      }

      // Pago solo con Giftcard (totalFinal = 0)
      if (totalFinal === 0 && giftcardApplied > 0) {
        const confirmRes = await fetch("/api/pagos/giftcard/confirmar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: giftcardCode,
            amount: giftcardApplied,
            pagoId, // pago proveedor = giftcard
            source: "giftcard_only",

          }),
        });

        const confirmData = await confirmRes.json();

        if (!confirmRes.ok || !confirmData.success) {
          toast.custom(
            <ErrorToast
              title="Error"
              subtitle="No se pudo confirmar la giftcard. Intenta nuevamente."
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

        // Redirigir a página de éxito (sin pasarela)
        const loadingToastGifcard = toast.custom(
          <LoadingToast
            title="Pagando con Giftcard..."
            subtitle="Por favor espera un momento."
          />,
          {
            duration: Infinity,
            position: "bottom-center",
            icon: null,
            style: { background: "transparent", boxShadow: "none", padding: 0 },
          }
        );
        setTimeout(() => {
          toast.dismiss(loadingToastGifcard);
          // Redirigir pagina de exito giftcard
          window.location.href = `/pago/giftcard/success?pedido=${numeroPedido}`;
        }, 2500);
        return;
      }



      //Metodo pago Khipu
      if (metodoPago === "khipu") {

        const res = await fetch("/api/pagos/khipu/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalFinal,
            cliente,
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
          {/* Toggle Giftcard */}
          <button
            type="button"
            onClick={() => setShowGiftcard((prev) => !prev)}
            className="flex items-center gap-2 text-gray-800 font-semibold hover:text-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
              />
            </svg>
            <span>Ingresar Giftcard</span>
          </button>

          {/* Contenido Giftcard */}
          {showGiftcard && (
            <>
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
                    {giftcardLoading ? "Validando..." : "Aplicar"}
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
            </>
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
              disabled={totalFinal > 0 && !metodoPago}
              className={`w-full font-bold py-3 rounded-xl transition-all duration-300 ${totalFinal === 0 || metodoPago
                ? "bg-gradient-to-br from-green-600 via-green-500 to-emerald-400 text-white hover:shadow-lg hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              onClick={handlePago}
            >
              {totalFinal === 0
                ? "Confirmar compra"
                : metodoPago
                  ? `Pagar ${formatCLP(totalFinal)}`
                  : "Selecciona un método de pago"}
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
      {/* Términos y condiciones */}
      <p className="mt-6 text-xs text-gray-500 text-center leading-snug">
        Al continuar con la compra, estoy aceptando los{" "}
        <a
          href={legalPdfUrl ? `${STRAPI_URL}${legalPdfUrl}` : "#"}
          download
          target="_blank"
          rel="noopener noreferrer"
          className={`underline ${legalPdfUrl
            ? "text-blue-600 hover:text-blue-700"
            : "text-gray-400 cursor-not-allowed"
            }`}
        >
          Términos y condiciones
        </a>{" "}
        y las{" "}
        <a
          href={privacyPdfUrl ? `${STRAPI_URL}${privacyPdfUrl}` : "#"}
          download
          target="_blank"
          rel="noopener noreferrer"
          className={`underline ${privacyPdfUrl
            ? "text-blue-600 hover:text-blue-700"
            : "text-gray-400 cursor-not-allowed"
            }`}
        >
          Políticas de Privacidad
        </a>.
      </p>
    </div>
  );
}
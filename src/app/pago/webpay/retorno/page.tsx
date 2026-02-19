"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import LoadingToast from '@/components/UI/LoadingToast';
import Header from "@/components/client/Header/Header";
import { useCart } from "@/hooks/useCart";

export default function WebpayRetorno() {
  const router = useRouter();
  const params = useSearchParams();

  const { clearCartSuccess } = useCart();

  useEffect(() => {

    // 1) Mostrar el toast AQUÍ → ahora siempre se muestra
    const loadingToastWebPay = toast.custom(
      <LoadingToast
        title="Confirmando pago..."
        subtitle="Por favor espera un momento."
      />,
      {
        duration: Infinity,
        position: "bottom-center",
        icon: null,
        style: { background: "transparent", boxShadow: "none", padding: 0 },
      }
    );

    // 2) Agregar delay para que alcance a leerse
    const timer = setTimeout(() => {
      ejecutarFlujo(loadingToastWebPay);
    }, 2500);

    return () => clearTimeout(timer);

  }, []);

  // ---------------------------------------------------------
  // FUNCION COMPLETA DE PROCESO WEBPAY
  // ---------------------------------------------------------
  const ejecutarFlujo = async (loadingToastWebPay: string) => {
    const tokenWs = params.get("token_ws");
    const tbkToken = params.get("TBK_TOKEN");

    // Cancelado por usuario
    if (tbkToken && !tokenWs) {
      toast.dismiss(loadingToastWebPay);
      router.push("/pago/webpay/error?tipo=cancelado");
      return;
    }

    // Inconsistencia
    if (tbkToken && tokenWs) {
      toast.dismiss(loadingToastWebPay);
      router.push("/pago/webpay/error?tipo=inconsistencia");
      return;
    }

    // No llegó token
    if (!tokenWs) {
      toast.dismiss(loadingToastWebPay);
      router.push("/pago/webpay/error?tipo=sin_token");
      return;
    }

    try {
      // Confirmar Webpay, este endpoint se encarga de llamar a restar stock si el token webpay es valido.
      const res = await fetch("/api/pagos/webpay/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_ws: tokenWs }),
      });

      const data = await res.json();

      if (!data.ok) {
        // /pago/webpay/error?tipo=fallo_confirmacion
        toast.dismiss(loadingToastWebPay);
         const encoded = encodeURIComponent(JSON.stringify(data));
        router.push(`/pago/webpay/error?data=${encoded}&&tipo=fallo_confirmacion`);
        return;
      }

      toast.dismiss(loadingToastWebPay);
       clearCartSuccess();
      const encoded = encodeURIComponent(JSON.stringify(data));
      router.push(`/pago/webpay/confirmacion?data=${encoded}`);


    } catch (error) {
      toast.dismiss(loadingToastWebPay);
      router.push("/pago/webpay/error?tipo=error_backend");
    }
  };

  return (
    <Header />
  );
}

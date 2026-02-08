// src/lib/emailTemplates/webpayComprobante.ts

interface WebpayComprobanteParams {
  email: string;
  data: any; // aquí va todo el JSON que Webpay te entrega y tú reenvías
}

export function generarHTMLComprobanteWebpay({
  email,
  data,
}: WebpayComprobanteParams) {
  const w = data.webpay;

  const paymentTypeMap: Record<string, string> = {
    VN: "Crédito - Venta Normal",
    VC: "Crédito - Cuotas",
    SI: "Crédito - 3 cuotas sin interés",
    S2: "Crédito - 2 cuotas sin interés",
    VP: "Débito",
  };

  const paymentTypeLabel =
    paymentTypeMap[w?.payment_type_code] ?? "Desconocido";

  const fecha = new Date(w.transaction_date).toLocaleString("es-CL");

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #0a7cff;">Comprobante de Pago Webpay</h2>

      <p>Hola,</p>
      <p>Adjuntamos el comprobante de tu pago realizado a través de Webpay.</p>

      <hr style="margin: 20px 0;" />

      <h3>📄 Detalles de la transacción</h3>

      <ul style="line-height: 1.7;">
        <li><strong>Orden de compra:</strong> ${w.buy_order}</li>
        <li><strong> Código de autorización:</strong> ${w.authorization_code}</li>
        <li><strong>Monto pagado:</strong> $${w.amount.toLocaleString("es-CL")}</li>
        <li><strong>Fecha:</strong> ${fecha}</li>
        <li><strong>Método de pago:</strong> ${paymentTypeLabel}</li>
        <li><strong>Tarjeta:</strong> **** **** **** ${
          w.card_detail?.card_number ?? "N/A"
        }</li>
        <li><strong>Estado:</strong> ${w.status}</li>
      </ul>

      <hr style="margin: 20px 0;" />

      <p>
        Gracias por tu compra.<br />
        Si tienes alguna duda o necesitas asistencia, puedes responder a este correo.
      </p>

       © ${new Date().getFullYear()} Agroplastic · Soluciones para todo
                   <p style="margin-top: 30px; font-size: 12px; color: #777;">
                  Este es un comprobante generado automáticamente. No respondas a esta casilla.
                  </p>
    </div>
  `;
}

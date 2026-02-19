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
  const pedido = data.pedido;

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
      <h2 style="color: #0a7cff;">Comprobante de Pago - Pedido #${pedido.numero_pedido}</h2>

      <p>Hola, Gracias por tu compra</p>
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


      <h3>📦 Detalle del pedido</h3>
      <ul>
        <li><strong>N° Pedido:</strong> ${pedido.numero_pedido}</li>
        <li><strong>Estado:</strong> ${pedido.estado}</li>
        <li><strong>Total:</strong> $${pedido.total.toLocaleString("es-CL")}</li>
        <li><strong>Entrega:</strong> ${pedido.tipo_delivery === "retiro" ? "Retiro en tienda" : "Envío a domicilio"}</li>
        <li><strong>Sucursal:</strong> ${pedido.sucursal}</li>
        ${
          pedido.tipo_delivery === "envio"
            ? `
          <li><strong>Comuna:</strong> ${pedido.comuna_envio}</li>
          <li><strong>Dirección:</strong> ${pedido.direccion_envio}</li>
        `
            : ""
        }
      </ul>

      <hr style="margin: 20px 0;" />

      <p>
        Gracias por tu compra.<br />
      </p>

       © ${new Date().getFullYear()} Agroplastic · Soluciones para todo
                   <p style="margin-top: 30px; font-size: 12px; color: #777;">
                  Este es un comprobante generado automáticamente. No respondas a esta casilla.
                  </p>
    </div>
  `;
}

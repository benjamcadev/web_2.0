interface KhipuComprobanteProps {
  pago: any;
  pedido: any;
}

export function generarHtmlKhipuComprobante({
  pago,
  pedido,
}: KhipuComprobanteProps) {
  return `
  <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:24px">
    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; padding:24px">
      
      <h2 style="color:#16a34a; text-align:center;">
        ✅ Pago recibido correctamente
      </h2>

      <p style="text-align:center;">
        Gracias por tu compra en <strong>Agroplastic</strong>
      </p>

      <hr />

      <h3>💳 Detalle del pago</h3>
      <ul>
        <li><strong>ID Khipu:</strong> ${pago.payment_id}</li>
        <li><strong>Monto:</strong> $${Number(pago.amount).toLocaleString("es-CL")}</li>
        <li><strong>Banco:</strong> ${pago.bank}</li>
        <li><strong>Pagador:</strong> ${pago.payer_name}</li>
        <li><strong>Email:</strong> ${pago.payer_email}</li>
        <li><strong>Fecha:</strong> ${new Date(pago.conciliation_date).toLocaleString("es-CL")}</li>
      </ul>

      <hr />

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

      <hr />

      <p style="font-size:12px; color:#666; text-align:center">
        Este correo es un comprobante automático.  
        Agroplastic © ${new Date().getFullYear()}
      </p>

    </div>
  </div>
  `;
}
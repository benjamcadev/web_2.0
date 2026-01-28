interface CreditoComprobanteProps {
  pedido: any;
  pago: any;
  cliente: any;
  cupoTotal: number;
  cupoRestante: number;
  logoBase64?: string | null;
}

export function generarHtmlCreditoComprobante({
  pedido,
  pago,
  cliente,
  cupoTotal,
  cupoRestante,
  logoBase64
}: CreditoComprobanteProps) {
  const cupoUsado = cupoTotal - cupoRestante;
  const porcentajeUsado = Math.min(
    100,
    Math.round((cupoUsado / cupoTotal) * 100)
  );

  return `
  <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:24px">
    <div style="max-width:600px; margin:auto; background:white; border-radius:16px; padding:24px; box-shadow:0 4px 12px rgba(0,0,0,0.08)">
      <!-- Logo -->
      <div style="text-align:center; margin-bottom:24px;">
        ${
          logoBase64
            ? `<img src="${logoBase64}" alt="Agroplastic" style="max-width:180px;height:auto;display:inline-block;" />`
            : `<strong style="font-size:22px; display:inline-block;">Agroplastic</strong>`
        }
      </div>
      
      <!-- Encabezado estilo success -->
      <div style="text-align:center; margin-bottom:16px;">
        <div style="
          width:80px;
          height:80px;
          border-radius:50%;
          border:6px solid #4f46e5;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          margin-bottom:12px;
        ">
          <span style="font-size:40px; color:#4f46e5; font-weight:bold;">✓</span>
        </div>

        <h2 style="color:#111827; font-size:26px; margin:8px 0;">
          ¡Compra realizada con éxito!
        </h2>

        <p style="color:#374151; font-size:16px; margin:0;">
          Tu compra fue cargada correctamente a tu
          <span style="color:#4f46e5; font-weight:bold;">
            Crédito Interno
          </span>.
        </p>
      </div>

      <hr style="margin:24px 0;" />

      <h3 style="color:#166534;">🏢 Datos del cliente</h3>
      <ul style="padding-left:16px; color:#333;">
        <li><strong>Razón social:</strong> ${cliente?.factura.razonSocial || "—"}</li>
        <li><strong>RUT:</strong> ${cliente?.rut || "—"}</li>
        <li><strong>Email:</strong> ${cliente?.email || "—"}</li>
      </ul>

      <hr style="margin:24px 0;" />

      <h3 style="color:#166534;">📦 Detalle del pedido</h3>
      <ul style="padding-left:16px; color:#333;">
        <li><strong>N° Pedido:</strong> ${pedido.numero_pedido}</li>
        <li><strong>Total:</strong> $${Number(pedido.total).toLocaleString("es-CL")}</li>
        <li><strong>Entrega:</strong> ${
          pedido.tipo_delivery === "retiro"
            ? "Retiro en tienda"
            : "Envío a domicilio"
        }</li>
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

      <hr style="margin:24px 0;" />

      <h3 style="color:#166534;">💳 Resumen de crédito</h3>

      <p style="margin:4px 0;"><strong>Cupo total:</strong> $${cupoTotal.toLocaleString("es-CL")}</p>
      <p style="margin:4px 0;"><strong>Cupo utilizado:</strong> $${cupoUsado.toLocaleString("es-CL")}</p>
      <p style="margin:4px 0;"><strong>Cupo restante:</strong> 
        <span style="color:#16a34a; font-weight:bold;">
          $${cupoRestante.toLocaleString("es-CL")}
        </span>
      </p>

      <!-- Barra de cupo -->
      <div style="margin-top:12px;">
        <div style="width:100%; height:12px; background:#e5e7eb; border-radius:999px; overflow:hidden;">
          <div style="
            height:12px;
            width:${porcentajeUsado}%;
            background:linear-gradient(to right, #22c55e, #16a34a);
          "></div>
        </div>
        <p style="font-size:12px; color:#555; margin-top:6px;">
          Usado: $${cupoUsado.toLocaleString("es-CL")} de $${cupoTotal.toLocaleString("es-CL")} (${porcentajeUsado}%)
        </p>
      </div>

      <hr style="margin:24px 0;" />

      <h3 style="color:#166534;">🧾 Datos del pago</h3>
      <ul style="padding-left:16px; color:#333;">
        <li><strong>ID de pago:</strong> ${pago.documentId || pago.id}</li>
        <li><strong>Método:</strong> Crédito Interno</li>
        <li><strong>Fecha:</strong> ${new Date().toLocaleString("es-CL")}</li>
      </ul>

      <hr style="margin:24px 0;" />

      <p style="font-size:12px; color:#666; text-align:center;">
        Este correo es un comprobante automático de tu compra.<br/>
        Agroplastic © ${new Date().getFullYear()}
      </p>

    </div>
  </div>
  `;
}
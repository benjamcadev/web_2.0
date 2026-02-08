interface CreditoComprobanteProps {
  pedido: any;
  credito: any;
  cliente: any;
  cupoTotal: number;
  cupoRestante: number;
  logoBase64?: string | null;
}

export function generarHtmlCreditoComprobante({
  pedido,
  credito,
  cliente,
  cupoTotal,
  cupoRestante,
  logoBase64
}: CreditoComprobanteProps) {
  const cupoUsado = cupoTotal - cupoRestante;
  const porcentajeUsado = Math.min(100, Math.round((cupoUsado / cupoTotal) * 100));

  // Lógica para formatear la dirección según el tipo de entrega
  const infoEntrega = pedido.tipo_delivery === 'retiro'
    ? `<li><strong>Tipo de entrega:</strong> Retiro en Sucursal</li>
       <li><strong>Sucursal:</strong> ${pedido.sucursal}</li>`
    : `<li><strong>Tipo de entrega:</strong> Despacho a Domicilio</li>
       <li><strong>Dirección:</strong> ${pedido.direccion_envio}, ${pedido.comuna_envio}</li>`;

  // NUEVA LÓGICA: Si es 0 muestra "Contado", si no "X días"
  const textoPlazo = credito.plazo === 0 ? "Contado" : `${credito.plazo} días`;

  return `
  <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:24px">
    <div style="max-width:600px; margin:auto; background:white; border-radius:16px; padding:24px; box-shadow:0 4px 12px rgba(0,0,0,0.08)">
      <div style="text-align:center; margin-bottom:24px;">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Agroplastic" style="max-width:180px;height:auto;" />` : `<strong>Agroplastic</strong>`}
      </div>
      
      <div style="text-align:center; margin-bottom:16px;">
        <h2 style="color:#111827; font-size:26px; margin:8px 0;">¡Pedido Confirmado!</h2>
        <p style="color:#374151; font-size:16px; margin:0;">
          Tu compra ha sido procesada mediante <strong>Crédito Interno</strong>.
        </p>
      </div>

      <hr style="margin:24px 0;" />

      <h3 style="color:#166534;">📦 Detalle del pedido</h3>
      <ul style="padding-left:16px; color:#333;">
        <li><strong>N° Pedido:</strong> ${pedido.numero_pedido}</li>
        <li><strong>Total a pagar:</strong> $${Number(pedido.total).toLocaleString("es-CL")}</li>
        ${infoEntrega}
      </ul>

      <hr style="margin:24px 0;" />

      <h3 style="color:#166534;">💳 Información del Crédito</h3>
      <ul style="padding-left:16px; color:#333;">
        <li><strong>Folio Crédito:</strong> ${credito.documentId || credito.id}</li>
        <li><strong>Plazo:</strong> ${textoPlazo}</li>
        <li><strong>Fecha de Vencimiento:</strong> <span style="color:#dc2626; font-weight:bold;">${credito.fechaVencimiento}</span></li>
      </ul>

      <hr style="margin:24px 0;" />

      <h3 style="color:#166534;">📊 Resumen de tu Cupo</h3>
      <p style="margin:4px 0;"><strong>Cupo total:</strong> $${cupoTotal.toLocaleString("es-CL")}</p>
      <p style="margin:4px 0;"><strong>Cupo disponible:</strong> $${cupoRestante.toLocaleString("es-CL")}</p>

      <div style="margin-top:12px;">
        <div style="width:100%; height:12px; background:#e5e7eb; border-radius:999px; overflow:hidden;">
          <div style="height:12px; width:${porcentajeUsado}%; background:#16a34a;"></div>
        </div>
        <p style="font-size:12px; color:#555; margin-top:6px;">
          Has utilizado el ${porcentajeUsado}% de tu cupo autorizado.
        </p>
      </div>

      <hr style="margin:24px 0;" />
       © ${new Date().getFullYear()} Agroplastic · Soluciones para todo
                   <p style="margin-top: 30px; font-size: 12px; color: #777;">
                  Este es un comprobante generado automáticamente. No respondas a esta casilla.
                  </p>
    </div>
  </div>
  `;
}
interface WebpayComprobanteParams {
    data: any;
    logoBase64?: string | null;
}

export function generarHTMLComprobantePagoCreditoCliente({
    data,
    logoBase64
}: WebpayComprobanteParams) {
  
    // Extraemos los objetos de forma segura
    const w = data?.webpay;
    const k = data?.khipu; 

    // --- 1. LÓGICA DE DATOS COMUNES ---
    // Determinamos cuál es la fuente de la información principal
    
    // CORRECCIÓN: Convertimos explícitamente a Number() para asegurar el formato correcto
    const rawMonto = w ? w.amount : (k ? k.amount : 0);
    const monto = Number(rawMonto);

    const ordenCompra = w ? w.buy_order : (k ? k.transaction_id : "N/A");
    
    // Formateo de fecha seguro
    let fechaRaw = w?.transaction_date || k?.conciliation_date || k?.transfer_date || new Date().toISOString();
    const fecha = new Date(fechaRaw).toLocaleString("es-CL", {
        timeZone: "America/Santiago",
        hour12: false
    });

    // Mapeo de códigos de Webpay
    const paymentTypeMap: Record<string, string> = {
        VN: "Crédito - Venta Normal",
        VC: "Crédito - Cuotas",
        SI: "Crédito - 3 cuotas sin interés",
        S2: "Crédito - 2 cuotas sin interés",
        VP: "Débito",
    };
    
    const webpayTypeLabel = w ? (paymentTypeMap[w.payment_type_code] ?? "Webpay Plus") : "";


    // --- 2. GENERACIÓN DEL HTML ---
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">

      <div style="text-align:center; margin-bottom:24px;">
        ${logoBase64 ? `<img src="${logoBase64}" alt="Agroplastic" style="max-width:180px;height:auto;" />` : `<strong>Agroplastic</strong>`}
      </div>

      <h2 style="color: #0a7cff; text-align: center;">Comprobante de Pago</h2>

      <p>Hola,</p>
      <p>Adjuntamos el comprobante de tu pago realizado a través de <strong>${data.pago?.proveedor || 'Portal Web'}</strong>.</p>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />

      <h3 style="color: #444;">📄 Detalles de la transacción</h3>

      <ul style="line-height: 1.8; list-style-type: none; padding: 0;">
        
        <!-- DATOS COMUNES (Siempre se muestran) -->
        <li><strong>Identificador de pago:</strong> ${ordenCompra}</li>
        <!-- CORRECCIÓN: Usamos opciones para quitar decimales -->
        <li><strong>Monto pagado:</strong> $${monto.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</li>
        <li><strong>Fecha:</strong> ${fecha}</li>

        <!-- BLOQUE EXCLUSIVO WEBPAY -->
        ${w ? `
            <li><strong>Método de pago:</strong> ${webpayTypeLabel}</li>
            <li><strong>Estado:</strong> ${w.status}</li>
            <li><strong>Código de autorización:</strong> ${w.authorization_code}</li>
            ${w.card_detail?.card_number ? `<li><strong>Tarjeta:</strong> **** **** **** ${w.card_detail.card_number}</li>` : ''}
            ${w.installments_number > 0 ? `<li><strong>Cuotas:</strong> ${w.installments_number}</li>` : ''}
        ` : ''}

        <!-- BLOQUE EXCLUSIVO KHIPU -->
        ${k ? `
            <li><strong>Método de pago:</strong> Transferencia Khipu</li>
            ${k.bank ? `<li><strong>Banco origen:</strong> ${k.bank}</li>` : ''}
            ${k.bank_account_number ? `<li><strong>Cuenta de banco:</strong> ${k.bank_account_number}</li>` : ''}
            <li><strong>Estado:</strong> Pagado</li>
        ` : ''}

      </ul>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />

      <div style="text-align: center; font-size: 12px; color: #777;">
        © ${new Date().getFullYear()} Agroplastic · Soluciones para todo
        <p style="margin-top: 10px;">
           Si tienes dudas sobre este pago, contáctanos indicando el ID de la transacción.
        </p>
      </div>

    </div>
    `;
}
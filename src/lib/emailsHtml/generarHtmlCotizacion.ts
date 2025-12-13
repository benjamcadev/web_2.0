
import { CartItem } from '@/stores/useCartStore';
import { formatCLP } from '@/lib/formatCLP'
import { Sucursal } from '@/types/sucursales'
import { Cliente } from '@/types/cliente'

interface generarHtmlCotizacionProps {
    items: CartItem[],
    sucursal: Sucursal,
    cliente: ClienteCotizacionProps,
    totalPrice: number;
    cotizacionId: number;
}

interface ClienteCotizacionProps extends Cliente {
    solicitudEspecial: string;
}


export function generarHtmlCorreoCotizacion({ items, sucursal, cliente, totalPrice, cotizacionId }: generarHtmlCotizacionProps) {

    // Generar HTML del carrito
    const itemsHTML = items.map((item: any) => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px 8px;">
              <strong>${item.name}</strong>
            </td>
            <td style="padding: 12px 8px; text-align: center;">${item.cantidad}</td>
            <td style="padding: 12px 8px; text-align: right;">${formatCLP(item.price)}</td>
            <td style="padding: 12px 8px; text-align: right;"><strong>${formatCLP(item.price * item.cantidad)}</strong></td>
          </tr>
        `).join('');

    // HTML del correo para la sucursal
    const htmlSucursal = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Nueva Solicitud de Cotización</h1>
              <h2 style="margin: 0; font-size: 28px;">Cotización N° ${cotizacionId}</h2>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Sucursal: ${sucursal.nombre}</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Datos del Cliente</h2>
              <table style="width: 100%; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 40%;">Nombre Completo:</td>
                  <td style="padding: 8px 0;">${cliente.nombre} ${cliente.apellidos}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">RUT:</td>
                  <td style="padding: 8px 0;">${cliente.rut}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Correo:</td>
                  <td style="padding: 8px 0;">${cliente.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Teléfono:</td>
                  <td style="padding: 8px 0;">${cliente.telefono}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Dirección:</td>
                  <td style="padding: 8px 0;">${cliente.direccion}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Comuna:</td>
                  <td style="padding: 8px 0;">${cliente.comuna}</td>
                </tr>
              </table>
    
              ${cliente.solicitudEspecial ? `
              <h3 style="color: #1f2937; margin-top: 20px;">Solicitud Especial:</h3>
              <p style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                ${cliente.solicitudEspecial}
              </p>
              ` : ''}
    
              <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-top: 30px;">Detalle de Productos</h2>
              <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background: #3b82f6; color: white;">
                    <th style="padding: 12px 8px; text-align: left;">Producto</th>
                    <th style="padding: 12px 8px; text-align: center;">Cantidad</th>
                    <th style="padding: 12px 8px; text-align: right;">Precio Unit.</th>
                    <th style="padding: 12px 8px; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr style="background: #f3f4f6; font-weight: bold;">
                    <td colspan="3" style="padding: 15px 8px; text-align: right; font-size: 18px;">TOTAL:</td>
                    <td style="padding: 15px 8px; text-align: right; color: #3b82f6; font-size: 18px;">${formatCLP(totalPrice)}</td>
                  </tr>
                </tbody>
              </table>
    
              <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px; border: 2px solid #3b82f6;">
                <p style="margin: 0; text-align: center; color: #6b7280;">
                  Este correo fue generado automáticamente desde el carrito de compras.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

    return htmlSucursal;
}

export function generarHtmlCorreoCotizacionCliente({items, sucursal, cliente, totalPrice, cotizacionId }: generarHtmlCotizacionProps) {
    // HTML del correo para el cliente
    const htmlCliente = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">¡Hemos Recibido tu Solicitud!</h1>
           <h2 style="margin: 0; font-size: 28px;">Cotización N° ${cotizacionId}</h2>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #1f2937;">Hola <strong>${cliente.nombre}</strong>,</p>
          
          <p style="font-size: 14px; color: #4b5563;">
            Gracias por solicitar una cotización. Hemos recibido tu solicitud y la estamos procesando.
            Nuestro equipo se pondrá en contacto contigo a la brevedad.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">Sucursal Asignada:</h3>
            <p style="margin: 5px 0;"><strong>${sucursal.nombre}</strong></p>
            <p style="margin: 5px 0; color: #6b7280;">${sucursal.direccion}</p>
            <p style="margin: 5px 0; color: #6b7280;">Tel: ${sucursal.telefono_1}</p>
          </div>

          <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Resumen de tu Cotización</h2>
          
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; margin-top: 20px;">
            <thead>
              <tr style="background: #3b82f6; color: white;">
                <th style="padding: 12px 8px; text-align: left;">Producto</th>
                <th style="padding: 12px 8px; text-align: center;">Cant.</th>
                <th style="padding: 12px 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 8px;">${item.name}</td>
                  <td style="padding: 12px 8px; text-align: center;">${item.cantidad}</td>
                  <td style="padding: 12px 8px; text-align: right;"><strong>${formatCLP(item.price * item.cantidad)}</strong></td>
                </tr>
              `).join('')}
              <tr style="background: #f3f4f6; font-weight: bold;">
                <td colspan="2" style="padding: 15px 8px; text-align: right; font-size: 18px;">TOTAL:</td>
                <td style="padding: 15px 8px; text-align: right; color: #3b82f6; font-size: 18px;">${formatCLP(totalPrice)}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 30px; padding: 20px; background: #dbeafe; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return htmlCliente;
}
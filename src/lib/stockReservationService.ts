// lib/stockReservationService.ts

interface ReservaStock {
  producto_id: number;
  cantidad: number;
  session_id: string;
}

interface ReservaResponse {
  success: boolean;
  message?: string;
  stock_disponible?: number;
}

// Generar o recuperar session_id único para el cliente
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('cart_session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cart_session_id', sessionId);
  }
  
  return sessionId;
}

// Reservar stock al agregar producto al carrito
export async function reservarStock(
  productoId: string,
  cantidad: number
): Promise<ReservaResponse> {
  try {
    const sessionId = getSessionId();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reservas-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          producto: productoId,
          cantidad,
          session_id: sessionId,
          expira_en: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
          estado: 'activa'
        }
      }),
    });


    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.error?.message || 'Error al reservar stock'
      };
    }

    const data = await response.json();
    return {
      success: true,
      stock_disponible: data.data?.stock_disponible
    };
  } catch (error) {
    console.error('Error al reservar stock:', error);
    return {
      success: false,
      message: 'Error de conexión al reservar stock'
    };
  }
}

// Liberar stock al eliminar producto del carrito
export async function liberarStock(
  productoId: string,
  cantidad: number
): Promise<ReservaResponse> {
  try {
    const sessionId = getSessionId();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reservas-stock/liberar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        producto_id: productoId,
        cantidad,
        session_id: sessionId
      }),
    });

    if (!response.ok) {
      throw new Error('Error al liberar stock');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al liberar stock:', error);
    return {
      success: false,
      message: 'Error al liberar stock'
    };
  }
}

// Actualizar reserva al cambiar cantidad
export async function actualizarReserva(
  productoId: string,
  cantidadAnterior: number,
  cantidadNueva: number
): Promise<ReservaResponse> {
  const diferencia = cantidadNueva - cantidadAnterior;
  
  if (diferencia > 0) {
    // Necesita reservar más
    return await reservarStock(productoId, diferencia);
  } else if (diferencia < 0) {
    // Necesita liberar
    return await liberarStock(productoId, Math.abs(diferencia));
  }
  
  return { success: true };
}

// Verificar stock disponible antes de agregar al carrito
export async function verificarStockDisponible(
  productoId: number,
  cantidadSolicitada: number
): Promise<{ disponible: boolean; stock: number }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/productos/${productoId}?populate=*`
    );
    
    const data = await response.json();
    const producto = data.data;
    
    const stockDisponible = producto.stock_disponible || 0;
    
    return {
      disponible: stockDisponible >= cantidadSolicitada,
      stock: stockDisponible
    };
  } catch (error) {
    console.error('Error al verificar stock:', error);
    return { disponible: false, stock: 0 };
  }
}

// Limpiar reservas al vaciar carrito
export async function limpiarTodasLasReservas(): Promise<void> {
  try {
    const sessionId = getSessionId();
    
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reservas-stock/limpiar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
  } catch (error) {
    console.error('Error al limpiar reservas:', error);
  }
}

// Confirmar compra y convertir reservas en ventas definitivas
export async function confirmarCompra(): Promise<ReservaResponse> {
  try {
    const sessionId = getSessionId();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/reservas-stock/confirmar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error('Error al confirmar compra');
    }

    // Limpiar session_id después de compra exitosa
    localStorage.removeItem('cart_session_id');
    
    return { success: true };
  } catch (error) {
    console.error('Error al confirmar compra:', error);
    return {
      success: false,
      message: 'Error al confirmar la compra'
    };
  }
}
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/types/cart';
import { pluralizeUnit } from '@/lib/pluralizeUnit'

import {
  reservarStock,
  liberarStock,
  actualizarReserva,
  limpiarTodasLasReservas
} from '@/lib/stockReservationService';

export type DeliveryMethod = 'retiro' | 'envio';

export interface ShippingInfo {
  deliveryMethod: DeliveryMethod;
  sucursalId: number;
  sucursalNombre: string;
  costoEnvio: number;

  // Solo para envío a domicilio
  comuna?: string;
  direccion?: string;
}

interface CartStore {
  items: CartItem[];
  shippingInfo: ShippingInfo | null;

  // Acciones de items (ahora son async por el sistema de reservas)
  addItem: (item: CartItem) => Promise<{ success: boolean; message?: string }>;
  removeItem: (id: number) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (id: number, cantidad: number) => Promise<{ success: boolean; message?: string }>;
  clearCart: () => Promise<void>;

  // Acciones de envío
  setShippingInfo: (info: ShippingInfo) => void;
  clearShippingInfo: () => void;

  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalWithShipping: () => number;
  getItemQuantity: (id: number) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      shippingInfo: null,

      // ========================================
      // AGREGAR PRODUCTO AL CARRITO CON RESERVA
      // ========================================
      addItem: async (item) => {
        const existingItem = get().items.find((i) => i.documentId === item.documentId);
        const cantidadActual = existingItem?.cantidad || 0;
        const nuevaCantidad = cantidadActual + item.cantidad;

        // Intentar reservar stock
        const reserva = await reservarStock(item.documentId, item.cantidad);


        if (!reserva.success) {
          return {
            success: false,
            message: reserva.message || 'No hay suficiente stock disponible'
          };
        }

        // Si la reserva fue exitosa, agregar al carrito
        set((state) => {
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, cantidad: nuevaCantidad }
                  : i
              ),
            };
          } else {
            return {
              items: [...state.items, item],
            };
          }
        });

        return { success: true };
      },

      // ========================================
      // ELIMINAR PRODUCTO Y LIBERAR STOCK
      // ========================================
      removeItem: async (id) => {
        const item = get().items.find((i) => i.id === id);

        if (item) {
          // Liberar stock reservado
          const response = await liberarStock(item.documentId, item.cantidad);


          if (!response.success) {
            return {
              success: false,
              message: response.message || 'No se pudo eliminar el producto y liberar'
            };
          }

          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));

          return {
            success: response.success,
            message: "Stock liberado"
          };
        }



        return {
          success: true,
          message: "exito"
        };

      },

      // ========================================
      // ACTUALIZAR CANTIDAD Y AJUSTAR RESERVA
      // ========================================
      updateQuantity: async (id, cantidad) => {
        if (cantidad <= 0) {
          await get().removeItem(id);
          return { success: true };
        }

        const item = get().items.find((i) => i.id === id);

        if (item?.venta_minima) {
          if (cantidad < item.venta_minima) {
            const ventaMin = item.venta_minima || 1;
            const unidad = pluralizeUnit(item.unidad_venta, ventaMin);

            return { success: false, message: 'Cantidad no corresponde a la venta minima de ' + item.venta_minima + ' ' + unidad };
          }
        }

        if (!item) {
          return { success: false, message: 'Producto no encontrado' };
        }

        // Actualizar reserva de stock
        const resultado = await actualizarReserva(item.documentId, item.cantidad, cantidad);

        if (!resultado.success) {
          return {
            success: false,
            message: resultado.message || 'No hay suficiente stock disponible'
          };
        }

        // Si la actualización de reserva fue exitosa, actualizar carrito
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, cantidad } : item
          ),
        }));

        return { success: true };
      },

      // ========================================
      // VACIAR CARRITO Y LIBERAR TODAS LAS RESERVAS
      // ========================================
      clearCart: async () => {
        // Liberar todas las reservas de stock
        await limpiarTodasLasReservas();

        // Limpiar carrito y datos de envío
        set({ items: [], shippingInfo: null });
      },

      // ========================================
      // CONFIGURAR INFORMACIÓN DE ENVÍO
      // ========================================
      setShippingInfo: (info) => {
        set({ shippingInfo: info });
      },

      // Limpiar solo información de envío
      clearShippingInfo: () => {
        set({ shippingInfo: null });
      },

      // ========================================
      // COMPUTED VALUES (sin cambios)
      // ========================================

      // Obtener total de items (suma de cantidades)
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      // Obtener precio total de productos
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.cantidad,
          0
        );
      },

      // Obtener total con envío incluido
      getTotalWithShipping: () => {
        const subtotal = get().getTotalPrice();
        const shipping = get().shippingInfo?.costoEnvio || 0;
        return subtotal + shipping;
      },

      // Obtener cantidad de un producto específico
      getItemQuantity: (id) => {
        const item = get().items.find((i) => i.id === id);
        return item ? item.cantidad : 0;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
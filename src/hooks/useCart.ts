import { useCartStore } from '@/stores/useCartStore';
import { CartItem } from '@/types/cart'

interface AddItemParams {
  id: number;
  documentId: string;
  name: string;
  price: number;
  images: Array<{ url: string }>;
  slug: string;
  cantidad: number;
  oferta?: boolean;
  venta_minima?: number | 0;
  unidad_venta: string;
}

export function useCart() {
  const {
    items,
    addItem: addToStore,
    removeItem: removeFromStore,
    updateQuantity: updateQuantityInStore,
    clearCart: clearCartInStore,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
    shippingInfo,
    setShippingInfo,
    clearShippingInfo,
    getTotalWithShipping,
    updatePrice: updatePriceInStore,
    clearCartSuccess: clearCartSuccessInStore,
  } = useCartStore();

  // ========================================
  // AGREGAR PRODUCTO (async con manejo de stock)
  // ========================================
  const addItem = async (params: AddItemParams): Promise<{ success: boolean; message?: string }> => {
    const cartItem: CartItem = {
      id: params.id,
      documentId: params.documentId,
      name: params.name,
      price: params.price,
      images: params.images,
      slug: params.slug,
      cantidad: params.cantidad,
      oferta: params.oferta,
      venta_minima: params.venta_minima,
      unidad_venta: params.unidad_venta
    };

    // Llamar a la función async del store
    return await addToStore(cartItem);
  };

  // ========================================
  // ELIMINAR PRODUCTO (async con liberación de stock)
  // ========================================
  const removeItem = async (id: number): Promise<{ success: boolean; message?: string }> => {
    const response = await removeFromStore(id);
    return response;
  };

  // ========================================
  // ACTUALIZAR CANTIDAD (async con ajuste de reserva)
  // ========================================
  const updateQuantity = async (
    id: number, 
    cantidad: number
  ): Promise<{ success: boolean; message?: string }> => {
    return await updateQuantityInStore(id, cantidad);
  };

  // ========================================
  // VACIAR CARRITO (async con liberación de reservas)
  // ========================================
  const clearCart = async (): Promise<void> => {
    await clearCartInStore();
  };

  // ========================================
  // VACIAR CARRITO CUANDO SE COMPLETA LA COMPRA (async con liberación de reservas)
  // ========================================
  const clearCartSuccess = async (): Promise<void> => {
    await clearCartSuccessInStore();
  };



  // ========================================
  // ACTUALIZAR PRECIO (sync - solo local)
  // ========================================
  const updatePrice = (id: number | string, newPrice: number) => {
    updatePriceInStore(id, newPrice);
  };

  return {
    // State
    items,
    shippingInfo,
    
    // Acciones de productos (async)
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    clearCartSuccess,
    updatePrice,

    // Acciones de envío (sync)
    setShippingInfo,
    clearShippingInfo,

    // Computed values (funciones, no valores)
    getTotalItems,
    getTotalPrice,
    getTotalWithShipping,
    getItemQuantity,
  };
}
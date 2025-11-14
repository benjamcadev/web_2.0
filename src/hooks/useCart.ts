import { useCartStore, CartItem } from '@/stores/useCartStore';

interface AddItemParams {
  id: number;
  name: string;
  price: number;
  images: Array<{ url: string }>;
  slug: string;
  cantidad: number;
  oferta?: boolean;
}

export function useCart() {
  const {
    items,
    addItem: addToStore,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
  } = useCartStore();

  const addItem = (params: AddItemParams) => {
    const cartItem: CartItem = {
      id: params.id,
      name: params.name,
      price: params.price,
      images: params.images,
      slug: params.slug,
      cantidad: params.cantidad,
      oferta: params.oferta,
    };

    addToStore(cartItem);
  };

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,

    // ← devolver funciones, NO valores calculados
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
  };
}

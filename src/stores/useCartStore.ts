import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: number;
  documentId: string;
  name: string;
  price: number;
  images: Array<{ url: string }>;
  slug: string;
  cantidad: number;
  oferta?: boolean;
}

interface CartStore {
  items: CartItem[];
  
  // Acciones
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, cantidad: number) => void;
  clearCart: () => void;
  
  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (id: number) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Agregar producto al carrito
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          
          if (existingItem) {
            // Si ya existe, sumar la cantidad
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, cantidad: i.cantidad + item.cantidad }
                  : i
              ),
            };
          } else {
            // Si no existe, agregarlo
            return {
              items: [...state.items, item],
            };
          }
        });
      },

      // Eliminar producto del carrito
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      // Actualizar cantidad de un producto
      updateQuantity: (id, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(id);
          return;
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, cantidad } : item
          ),
        }));
      },

      // Limpiar carrito
      clearCart: () => {
        set({ items: [] });
      },

      // Obtener total de items (suma de cantidades)
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },

      // Obtener precio total
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.cantidad,
          0
        );
      },

      // Obtener cantidad de un producto específico
      getItemQuantity: (id) => {
        const item = get().items.find((i) => i.id === id);
        return item ? item.cantidad : 0;
      },
    }),
    {
      name: 'cart-storage', // Nombre en localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
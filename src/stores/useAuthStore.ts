import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  cliente: any | null;

  // acciones
  login: (data: { user: any; cliente: any }) => void;
  logout: () => void;
  setAuthFromBackend: (data: { user: any; cliente: any }) => void;
  updateCliente: (cliente: any) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  cliente: null,

  // Se llama al hacer login exitoso
  login: ({ user, cliente }) =>
    set({
      isAuthenticated: true,
      user,
      cliente,
    }),

  // Se llama al cerrar sesión
  logout: () =>
    set({
      isAuthenticated: false,
      user: null,
      cliente: null,
    }),

  // Se usará en la rehidratación (/api/auth/me)
  setAuthFromBackend: ({ user, cliente }) =>
    set({
      isAuthenticated: true,
      user,
      cliente,
    }),

  updateCliente: (cliente) =>
    set((state) => ({
      ...state,
      cliente,
    })),
}));
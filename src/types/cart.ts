export interface CartItem {
  id: number;
  documentId: string;
  name: string;
  price: number;
  images: Array<{ url: string }>;
  slug: string;
  cantidad: number;
  oferta?: boolean;
  venta_minima?: number;
  unidad_venta: string;
}
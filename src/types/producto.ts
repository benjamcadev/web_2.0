export interface Producto {
    id: number;
    documentId: string;
    name: string;
    price: number;
    slug: string;
    images: Images[];
    oferta: boolean;
    description: string;
    additional_information: string;
    internal_code: string;
    categoria: string;
    sku: string;
    unidad_venta: string;
    venta_minima: number;
    factor_conversion: number;
    stock_disponible: number;
}

interface Images {
    url: string;
}
export interface Producto {
    id: number;
    name: string;
    price: number;
    slug: string;
    images: Images[];
    oferta: boolean
}

interface Images {
    url: string;
}
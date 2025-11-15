export interface Producto {
    id: number;
    name: string;
    price: number;
    slug: string;
    images: Images[];
    oferta: boolean;
    description: string;
    additional_information: string;
}

interface Images {
    url: string;
}
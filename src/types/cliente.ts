export interface Cliente {
    id: number;
    rut: string;
    nombre: string;
    email: string;
    telefono: string;
    logo: Logo;
}

export interface Logo {
    url: string;
}
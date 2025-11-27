export interface Cliente {
    id: number;
    rut: string;
    nombre: string;
    apellidos: string;
    email: string;
    direccion: string;
    comuna: string;
    telefono: string;
    logo: Logo;
}

export interface Logo {
    url: string;
}
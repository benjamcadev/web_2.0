export interface Sucursal {
    id: number;
    nombre: string;
    ciudad: string;
    comunas : string[];
    direccion: string;
    correo: string;
    telefono_1: string;
    costosEnvio: Record<string, number>;
}
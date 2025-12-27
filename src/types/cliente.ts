// src/types/cliente.ts

export interface Cliente {
  id?: number;

  // Datos base (persona natural o empresa)
  rut: string;
  nombre: string;
  email: string;
  telefono?: string;

  // Dirección básica (boleta / envío)
  direccion?: string;
  comuna?: string;

  // Datos SOLO si es factura
  factura?: DatosFactura;

  // Extras
  logo?: Logo;
}

export interface DatosFactura {
  razonSocial: string;
  giro: string;

  // Dirección tributaria
  calle: string;
  numero: string;
  complemento?: string; // depto / oficina / casa
  comuna: string;
  ciudad: string; // localidad libre
}

export interface Logo {
  url: string;
}
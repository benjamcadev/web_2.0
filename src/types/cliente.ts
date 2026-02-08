// src/types/cliente.ts

export interface Cliente {
  id?: number;
  documentId?: string;

  // Datos base (persona natural o empresa)
  rut: string;
  nombre: string;
  email: string;
  telefono?: string;

  // Dirección básica (boleta / envío)
  direccion?: string;
  comuna?: string;

  //Datos si tiene cupo y si es empresa
  tipo_cliente: string;
  credito_habilitado: boolean;
  cupo_disponible?: number;
  cupo_total?: number;
  cupo_utilizado?: number;
  credito_7?: boolean;
  credito_15?: boolean;
  credito_30?: boolean;
  credito_60?: boolean;
  credito_90?: boolean;

  // Datos SOLO si es factura
  factura?: DatosFactura;

  // Extras
  logo?: Logo;
}

export interface DatosFactura {
  razonSocial: string;
  giro: string;
  condicionPago?: string;

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
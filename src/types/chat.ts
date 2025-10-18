
export interface Message {
  sender: "user" | "bot";
  text: string;
  products?: Product[];
  text_closing?: string;
}

export interface Product {
  name: string;
  url: string;
  images: Images[];
}

interface Images {
  url: string;
}

export interface Order {
  numero: number;
  estado: string;
  fecha_envio: string;
  fecha_entrega: string;
}



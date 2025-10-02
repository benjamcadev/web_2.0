
export interface Message {
  sender: "user" | "bot";
  text: string;
  products?: Product[];
  text_closing?: string;
}

export interface Product {
  name: string;
  url: string;
  image: string;
}

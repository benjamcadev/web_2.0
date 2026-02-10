// lib/validarPrecioCarrito.ts
import { CartItem } from "@/types/cart"; 

interface CarritoValidarPrecioProps {
    items: CartItem[];
}

export async function validarPrecioCarrito({ items: carrito }: CarritoValidarPrecioProps) {
  const res = await fetch("/api/carrito/validar-precio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ carrito }),
  });

  return res.json();
}

import { getSessionId } from './stockReservationService'
import { CartItem } from "@/types/cart";

interface CarritoValidarProps {
    items: CartItem[]
}

export async function validarCarritoAntesDePagar({ items: carrito}: CarritoValidarProps) {

    const sessionId = getSessionId();

  const res = await fetch("/api/reservas-stock/confirmar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ carrito, sessionId }),
  });

  return res.json();
}

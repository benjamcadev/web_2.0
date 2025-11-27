export function pluralizeUnit(unit: string, cantidad: number) {
  if (cantidad === 1) return unit;

  const reglas: Record<string, string> = {
    unidad: "unidades",
    caja: "cajas",
    kilo: "kilos",
    metro: "metros",
    litro: "litros",
  };

  return reglas[unit] || unit; 
}

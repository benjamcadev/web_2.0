const BLOCKED_RUTS = new Set([
  "1-1",
  "11.111.111-1",
  "12.345.678-5",
  "9.999.999-9",
]);

function normalizeRut(rut: string): string {
  return rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
}

function hasRepeatedDigits(cuerpo: string): boolean {
  return /^(\d)\1+$/.test(cuerpo);
}

export function validateRut(rut: string): boolean {
  if (!rut) return false;

  const normalized = normalizeRut(rut);
  if (normalized.length < 2) return false;

  const cuerpo = normalized.slice(0, -1);
  const dv = normalized.slice(-1);

  // Longitud realista
  if (cuerpo.length < 7 || cuerpo.length > 8) return false;

  if (!/^\d+$/.test(cuerpo)) return false;
  if (hasRepeatedDigits(cuerpo)) return false;

  // Cálculo DV
  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resultado = 11 - (suma % 11);
  const dvEsperado =
    resultado === 11 ? "0" : resultado === 10 ? "K" : String(resultado);

  if (dv !== dvEsperado) return false;

  // Bloqueo explícito
  const pretty = `${parseInt(cuerpo, 10)}-${dv}`;
  if (BLOCKED_RUTS.has(pretty)) return false;

  return true;
}
export function validateRut(rut: string): boolean {
    if (!rut) return false;

    // Normalizar
    rut = rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();

    if (rut.length < 2) return false;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);

    if (!/^\d+$/.test(cuerpo)) return false;

    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    // Aquí está la diferencia ↓↓↓
    let dvEsperado: string;

    const resultado = 11 - (suma % 11);
    if (resultado === 11) dvEsperado = "0";
    else if (resultado === 10) dvEsperado = "K";
    else dvEsperado = resultado.toString();

    return dv === dvEsperado;
}

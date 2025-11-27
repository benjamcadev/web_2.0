export function formatRut(value: string): string {
    // Eliminar puntos y guiones
    value = value.replace(/\./g, "").replace(/-/g, "");

    // Si es vacío, devolver tal cual
    if (value.length === 0) return value;

    // DV
    const dv = value.slice(-1);
    let cuerpo = value.slice(0, -1);

    // Formatear cuerpo con puntos
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${cuerpo}-${dv}`;
}

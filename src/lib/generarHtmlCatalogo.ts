import path from "path";
import fs from "fs";


export function generarHtml(productosArray: any[]) {
  if (!productosArray || productosArray.length === 0) {
    return `<html><body><p>No hay productos</p></body></html>`;
  }

  //url strapi
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

  //sacar logo empresa
  // Resuelve la ruta absoluta del logo
  const logoPath = path.join(process.cwd(), "public", "logo.webp");

  // Convierte el logo a base64
  const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
  const logoDataUri = `data:image/png;base64,${logoBase64}`;

  // Tomamos la categoría del primer producto (asumimos que todos son de la misma categoría)
  const categoriaNombre = productosArray[0]?.categoria?.nombre || "Catálogo";

  // Generar el HTML de cada producto en el grid
  const productosHtml = productosArray
    .map((prod) => {
      // Tomamos la imagen grande si existe
      const imagenUrl =
        prod.images?.[0]?.formats?.thumbnail?.url || prod.images?.[0]?.url || "";

      return `
        <div class="producto">
          <img src="${STRAPI_URL}${imagenUrl}" alt="${prod.name}" />
          <p class="nombre-producto">${prod.name}</p>
        </div>
      `;
    })
    .join("");

  // HTML completo
  const html = `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Catálogo PDF</title>
      <style>
        /* Reset básico */
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }

        body { 
          background-color: #ffffff;
          display: flex; 
          flex-direction: column; 
          min-height: 100vh; 
        }

        /* Barra superior */
        .barra-superior {
          background-color: #1e40af; /* azul */
          height: 60px;
        }

        /* Título categoría */
        .titulo-categoria {
          text-align: center;
          color: #1e40af;
          font-size: 32px;
          font-weight: bold;
          margin: 20px 0;
        }

        /* Separador */
        .separador {
          width: 80%;
          height: 2px;
          background-color: #1e40af;
          margin: 0 auto 20px auto;
        }

        /* Grid de productos */
        .grid-productos {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
          padding: 0 40px;
        }

        .producto {
          text-align: center;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .producto img {
          width: 100%;
          height: auto;
          border-radius: 4px;
        }

        .nombre-producto {
          font-weight: bold;
          margin-top: 8px;
          font-size: 14px;
        }

        /* Footer con olas */
        .footer-olas {
          position: relative;
          margin-top: auto;
          height: 120px;
          background: linear-gradient(
            135deg,
            #3b82f6 20%,
            #facc15 40%,
            #f472b6 60%,
            #fb923c 80%
          );
          border-top-left-radius: 60% 20px;
          border-top-right-radius: 60% 20px;
        }

        .footer-logo {
          position: absolute;
          bottom: 10px;
          left: 20px;
          height: 80px;
        }

        /* Ajuste responsivo si se quiere imprimir en PDF A4 */
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="barra-superior"></div>
      <h1 class="titulo-categoria">${categoriaNombre}</h1>
      <div class="separador"></div>
      <div class="grid-productos">
        ${productosHtml}
      </div>

      <div class="footer-olas">
        <img class="footer-logo" src="${logoDataUri}" alt="Logo Empresa" />
      </div>
    </body>
  </html>
  `;

  return html;
}

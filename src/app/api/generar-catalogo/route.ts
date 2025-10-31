import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productosArray = body.data;
    console.log('body:', body);
    console.log('body.data:', body.data);

    

    // Ruta absoluta de la fuente
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'OpenSans-Regular.ttf');

    if (!fs.existsSync(fontPath)) {
      throw new Error('No se encontró la fuente OpenSans en public/fonts');
    }

    // Crear documento PDF usando la fuente desde el inicio
    const doc = new PDFDocument({
      margin: 40,
      font: fontPath, // Asignamos la fuente predeterminada aquí
    });

    const buffers: Buffer[] = [];

    // Capturar los datos binarios
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('error', (err) => {
      console.error('Error en PDFKit:', err);
    });

    // Encabezado
    doc.fontSize(22).text('Catálogo de Productos', { align: 'center' });
    doc.moveDown(1);

    // Recorrer productos
    for (const producto of productosArray) {
      const nombre = producto.name || 'Producto sin nombre';
      const categoria = producto.categoria?.nombre || 'Sin categoría';
      const images = producto.images || [];

      doc.fontSize(14).text(nombre, { underline: true });
      doc.fontSize(12).fillColor('#555').text(`Categoría: ${categoria}`);
      doc.moveDown(0.5);

      // Mostrar imagen si existe
      if (images.length > 0) {
        const imageUrl = images[0]?.url;
        if (imageUrl) {
          try {
            const response = await fetch(`${process.env.STRAPI_URL}${imageUrl}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            doc.image(buffer, { fit: [150, 150], align: 'center', valign: 'center' });
            doc.moveDown(1);
          } catch (err) {
            console.error('Error cargando imagen:', err);
          }
        }
      }

      doc.moveDown(1.5);
      doc.fillColor('black');
    }

    doc.end();

    // Esperar que termine y combinar buffers
    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
    });

    // Devolver PDF
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=catalogo.pdf',
      },
    });
  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json({ error: 'Error interno al generar el PDF' }, { status: 500 });
  }
}

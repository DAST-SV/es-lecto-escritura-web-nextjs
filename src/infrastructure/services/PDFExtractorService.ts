/**
 * UBICACIÓN: src/infrastructure/services/PDFExtractorService.ts
 * Servicio para extraer páginas de PDF como imágenes
 */

import { pdfjs } from 'react-pdf';
import type { Page } from '@/src/core/domain/types';

// Configurar worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface PDFExtractionResult {
  pages: Page[];
  totalPages: number;
  pdfTitle?: string;
}

export class PDFExtractorService {
  /**
   * Extrae todas las páginas de un PDF como imágenes
   */
  static async extractPagesFromPDF(file: File): Promise<PDFExtractionResult> {
    console.log('📄 Extrayendo páginas de PDF:', file.name);

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const totalPages = pdf.numPages;
    console.log(`📊 Total de páginas: ${totalPages}`);

    const pages: Page[] = [];

    // Extraer cada página
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      console.log(`🔄 Procesando página ${pageNum}/${totalPages}`);

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // Escala para calidad

      // Crear canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error('❌ No se pudo crear contexto canvas');
        continue;
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // ✅ CORRECCIÓN: Renderizar página en canvas con ambos parámetros
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas, // ⬅️ AGREGADO
      }).promise;

      // Convertir canvas a Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('No se pudo convertir canvas a blob'));
        }, 'image/jpeg', 0.9);
      });

      // Crear URL temporal
      const imageUrl = URL.createObjectURL(blob);

      // Crear objeto Page
      const pageData: Page = {
        id: `pdf-page-${pageNum}-${Date.now()}`,
        layout: 'ImageFullLayout',
        title: '',
        text: '',
        image: imageUrl,
        background: 'blanco',
        file: blob, // Guardar blob para subir después
      };

      pages.push(pageData);
    }

    console.log(`✅ ${pages.length} páginas extraídas correctamente`);

    // Intentar obtener título del PDF
    const metadata = await pdf.getMetadata();
    const pdfTitle = (metadata.info as any)?.Title || file.name.replace('.pdf', '');

    return {
      pages,
      totalPages,
      pdfTitle,
    };
  }

  /**
   * Limpia URLs temporales de blobs
   */
  static cleanupBlobUrls(pages: Page[]): void {
    pages.forEach(page => {
      if (page.image && page.image.startsWith('blob:')) {
        URL.revokeObjectURL(page.image);
      }
    });
  }
}
/**
 * UBICACIÓN: src/infrastructure/services/PDFExtractorService.ts
 * ✅ VERSIÓN CORREGIDA: Solo se ejecuta en el cliente
 */

import type { Page } from '@/src/core/domain/types';

// ✅ CRÍTICO: Importación condicional solo en cliente
let pdfjs: any;
if (typeof window !== 'undefined') {
  pdfjs = require('react-pdf').pdfjs;
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export class PDFExtractorService {
  /**
   * Extrae todas las páginas de un PDF como imágenes
   */
  static async extractPagesFromPDF(file: File): Promise<{
    pages: Page[];
    pageWidth?: number;
    pageHeight?: number;
  }> {
    // ✅ Verificar que estamos en el cliente
    if (typeof window === 'undefined') {
      throw new Error('PDFExtractorService solo puede ejecutarse en el cliente');
    }

    if (!pdfjs) {
      throw new Error('react-pdf no está disponible');
    }

    try {
      console.log('📄 Iniciando extracción de PDF...');

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const numPages = pdf.numPages;
      console.log(`📊 PDF tiene ${numPages} páginas`);

      const pages: Page[] = [];
      let pageWidth: number | undefined;
      let pageHeight: number | undefined;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        // Guardar dimensiones de la primera página
        if (pageNum === 1) {
          pageWidth = viewport.width;
          pageHeight = viewport.height;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('No se pudo crear contexto 2D');
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageUrl = canvas.toDataURL('image/png');

        pages.push({
          id: `page-${pageNum}`,
          layout: 'ImageFullLayout',
          title: '',
          text: '',
          image: imageUrl,
          background: null,
        });

        console.log(`✅ Página ${pageNum}/${numPages} extraída`);
      }

      console.log('✅ Extracción completada');

      return {
        pages,
        pageWidth,
        pageHeight,
      };
    } catch (error) {
      console.error('❌ Error extrayendo PDF:', error);
      throw new Error('Error al procesar el PDF');
    }
  }

  /**
   * Limpia las URLs de blob para liberar memoria
   */
  static cleanupBlobUrls(pages: Page[]) {
    pages.forEach((page) => {
      if (page.image && page.image.startsWith('blob:')) {
        URL.revokeObjectURL(page.image);
      }
    });
  }
}
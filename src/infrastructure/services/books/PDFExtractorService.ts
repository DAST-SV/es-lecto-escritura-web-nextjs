/**
 * UBICACIÓN: src/infrastructure/services/books/PDFExtractorService.ts
 * ✅ VERSIÓN ACTUALIZADA: Extrae imágenes Y texto de cada página
 */

import type { Page } from '@/src/core/domain/types';

// ✅ CRÍTICO: Importación condicional solo en cliente
let pdfjs: any;
if (typeof window !== 'undefined') {
  pdfjs = require('react-pdf').pdfjs;
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export interface ExtractedPage extends Page {
  /** Texto extraído de la página para TTS */
  extractedText: string;
}

export interface PDFExtractionResult {
  pages: ExtractedPage[];
  pageWidth?: number;
  pageHeight?: number;
  totalTextLength: number;
}

export class PDFExtractorService {
  /**
   * Extrae todas las páginas de un PDF como imágenes Y texto
   */
  static async extractPagesFromPDF(file: File): Promise<PDFExtractionResult> {
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

      const pages: ExtractedPage[] = [];
      let pageWidth: number | undefined;
      let pageHeight: number | undefined;
      let totalTextLength = 0;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        // Guardar dimensiones de la primera página
        if (pageNum === 1) {
          pageWidth = viewport.width;
          pageHeight = viewport.height;
        }

        // ✅ Extraer imagen
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

        // ✅ NUEVO: Extraer texto de la página
        const extractedText = await this.extractTextFromPage(page);
        totalTextLength += extractedText.length;

        pages.push({
          id: `page-${pageNum}`,
          layout: 'ImageFullLayout',
          title: '',
          text: '',
          image: imageUrl,
          background: null,
          extractedText, // ✅ Texto para TTS
        });

        console.log(`✅ Página ${pageNum}/${numPages} extraída (${extractedText.length} chars de texto)`);
      }

      console.log(`✅ Extracción completada. Total: ${totalTextLength} caracteres de texto`);

      return {
        pages,
        pageWidth,
        pageHeight,
        totalTextLength,
      };
    } catch (error) {
      console.error('❌ Error extrayendo PDF:', error);
      throw new Error('Error al procesar el PDF');
    }
  }

  /**
   * ✅ NUEVO: Extrae el texto de una página específica
   */
  private static async extractTextFromPage(page: any): Promise<string> {
    try {
      const textContent = await page.getTextContent();

      // Agrupar items por líneas basado en la posición Y
      const lines: Map<number, string[]> = new Map();

      for (const item of textContent.items) {
        if (item.str && item.str.trim()) {
          // Redondear Y para agrupar texto en la misma línea
          const lineY = Math.round(item.transform[5]);

          if (!lines.has(lineY)) {
            lines.set(lineY, []);
          }
          lines.get(lineY)!.push(item.str);
        }
      }

      // Ordenar líneas de arriba a abajo (Y mayor = más arriba en PDF)
      const sortedLines = Array.from(lines.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([, words]) => words.join(' '));

      // Unir líneas con espacios, limpiar espacios múltiples
      const text = sortedLines
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      return text;
    } catch (error) {
      console.warn('⚠️ Error extrayendo texto de página:', error);
      return '';
    }
  }

  /**
   * Extrae páginas de un PDF a partir de una URL (para modo edición)
   */
  static async extractPagesFromUrl(url: string): Promise<PDFExtractionResult> {
    if (typeof window === 'undefined') {
      throw new Error('PDFExtractorService solo puede ejecutarse en el cliente');
    }

    if (!pdfjs) {
      throw new Error('react-pdf no está disponible');
    }

    try {
      console.log('📄 Extrayendo PDF desde URL...');

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error descargando PDF: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const numPages = pdf.numPages;
      console.log(`📊 PDF tiene ${numPages} páginas`);

      const pages: ExtractedPage[] = [];
      let pageWidth: number | undefined;
      let pageHeight: number | undefined;
      let totalTextLength = 0;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

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
        const extractedText = await this.extractTextFromPage(page);
        totalTextLength += extractedText.length;

        pages.push({
          id: `page-${pageNum}`,
          layout: 'ImageFullLayout',
          title: '',
          text: '',
          image: imageUrl,
          background: null,
          extractedText,
        });

        console.log(`✅ Página ${pageNum}/${numPages} extraída (${extractedText.length} chars)`);
      }

      console.log(`✅ Extracción desde URL completada. Total: ${totalTextLength} caracteres`);

      return { pages, pageWidth, pageHeight, totalTextLength };
    } catch (error) {
      console.error('❌ Error extrayendo PDF desde URL:', error);
      throw new Error('Error al procesar el PDF desde URL');
    }
  }

  /**
   * Extrae solo el texto de un PDF (sin imágenes)
   * Útil para procesamiento posterior
   */
  static async extractTextOnly(file: File): Promise<string[]> {
    if (typeof window === 'undefined') {
      throw new Error('PDFExtractorService solo puede ejecutarse en el cliente');
    }

    if (!pdfjs) {
      throw new Error('react-pdf no está disponible');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const texts: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const text = await this.extractTextFromPage(page);
        texts.push(text);
      }

      return texts;
    } catch (error) {
      console.error('❌ Error extrayendo texto:', error);
      throw new Error('Error al extraer texto del PDF');
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

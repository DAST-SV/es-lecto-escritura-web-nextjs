/**
 * UBICACIÓN: src/infrastructure/services/books/PDFExtractorService.ts
 *
 * OPTIMIZACIONES vs versión anterior:
 *  · JPEG 0.72 en lugar de PNG → ~75% menos datos por página, encode más rápido
 *  · Escala 1.2× → canvas 64% más pequeño que 2.0× (44% más pequeño que 1.5×)
 *  · Render + texto en paralelo con Promise.all → ~30-40% más rápido por página
 *  · onPageExtracted callback → streaming progresivo (el flipbook muestra
 *    páginas a medida que se extraen, sin esperar todas)
 *  · Canvas reusado entre páginas → menos presión en GC
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

/** Callback llamado cuando cada página queda lista (para mostrar progresivamente) */
export type OnPageExtracted = (page: ExtractedPage, pageNum: number, total: number) => void;

export class PDFExtractorService {
  /**
   * Extrae todas las páginas de un PDF como imágenes + texto.
   * Usa JPEG 1.5× para minimizar el tiempo de extracción.
   * Si se provee `onPageExtracted`, la UI puede mostrar páginas de forma progresiva.
   */
  static async extractPagesFromPDF(
    file: File,
    onPageExtracted?: OnPageExtracted,
  ): Promise<PDFExtractionResult> {
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

      const numPages = pdf.numPages;
      const pages: ExtractedPage[] = [];
      let pageWidth: number | undefined;
      let pageHeight: number | undefined;
      let totalTextLength = 0;

      // Reusar un único canvas para todas las páginas → menos presión en GC
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('No se pudo crear contexto 2D');

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        // 1.2× mantiene buena calidad para lectura en pantalla y reduce el canvas
        // un 64% respecto a 2.0× — directamente proporcional al tiempo de render
        const viewport = page.getViewport({ scale: 1.2 });

        if (pageNum === 1) {
          pageWidth  = viewport.width;
          pageHeight = viewport.height;
        }

        // Redimensionar canvas solo si cambia el tamaño (por si hay páginas mixtas)
        if (canvas.width !== viewport.width || canvas.height !== viewport.height) {
          canvas.width  = viewport.width;
          canvas.height = viewport.height;
        }

        // Limpiar canvas antes de renderizar la página
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Render + extracción de texto en PARALELO → ~30-40% más rápido por página
        const [, extractedText] = await Promise.all([
          page.render({ canvasContext: context, viewport }).promise,
          this.extractTextFromPage(page),
        ]);

        // JPEG 0.72: encode más rápido, ~75% menos datos que PNG, calidad visual suficiente
        const imageUrl = canvas.toDataURL('image/jpeg', 0.72);

        totalTextLength += extractedText.length;

        const extractedPage: ExtractedPage = {
          id: `page-${pageNum}`,
          layout: 'ImageFullLayout',
          title: '',
          text: '',
          image: imageUrl,
          background: null,
          extractedText,
        };

        pages.push(extractedPage);

        // Streaming: notificar inmediatamente para que el flipbook pueda
        // mostrar esta página sin esperar las restantes
        onPageExtracted?.(extractedPage, pageNum, numPages);
      }

      return { pages, pageWidth, pageHeight, totalTextLength };
    } catch (error) {
      console.error('❌ Error extrayendo PDF:', error);
      throw new Error('Error al procesar el PDF');
    }
  }

  /**
   * Extrae páginas de un PDF a partir de una URL (modo edición).
   * Igual que extractPagesFromPDF pero carga desde URL remota.
   */
  static async extractPagesFromUrl(
    url: string,
    scale: number = 1.2,
    onPageExtracted?: OnPageExtracted,
  ): Promise<PDFExtractionResult> {
    if (typeof window === 'undefined') {
      throw new Error('PDFExtractorService solo puede ejecutarse en el cliente');
    }
    if (!pdfjs) {
      throw new Error('react-pdf no está disponible');
    }

    try {
      const loadingTask = pdfjs.getDocument(url);
      const pdf = await loadingTask.promise;

      const numPages = pdf.numPages;
      const pages: ExtractedPage[] = [];
      let pageWidth: number | undefined;
      let pageHeight: number | undefined;
      let totalTextLength = 0;

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('No se pudo crear contexto 2D');

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        if (pageNum === 1) {
          pageWidth  = viewport.width;
          pageHeight = viewport.height;
        }

        if (canvas.width !== viewport.width || canvas.height !== viewport.height) {
          canvas.width  = viewport.width;
          canvas.height = viewport.height;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        // Render + texto en paralelo
        const [, extractedText] = await Promise.all([
          page.render({ canvasContext: context, viewport }).promise,
          this.extractTextFromPage(page),
        ]);

        const imageUrl = canvas.toDataURL('image/jpeg', 0.72);
        totalTextLength += extractedText.length;

        const extractedPage: ExtractedPage = {
          id: `page-${pageNum}`,
          layout: 'ImageFullLayout',
          title: '',
          text: '',
          image: imageUrl,
          background: null,
          extractedText,
        };

        pages.push(extractedPage);
        onPageExtracted?.(extractedPage, pageNum, numPages);
      }

      return { pages, pageWidth, pageHeight, totalTextLength };
    } catch (error) {
      console.error('❌ Error extrayendo PDF desde URL:', error);
      throw new Error('Error al procesar el PDF desde URL');
    }
  }

  /**
   * Extrae solo el texto de un PDF (sin imágenes)
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
   * Extrae el texto de una página específica
   */
  private static async extractTextFromPage(page: any): Promise<string> {
    try {
      const textContent = await page.getTextContent();

      const lines: Map<number, string[]> = new Map();
      for (const item of textContent.items) {
        if (item.str && item.str.trim()) {
          const lineY = Math.round(item.transform[5]);
          if (!lines.has(lineY)) lines.set(lineY, []);
          lines.get(lineY)!.push(item.str);
        }
      }

      const sortedLines = Array.from(lines.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([, words]) => words.join(' '));

      return sortedLines.join(' ').replace(/\s+/g, ' ').trim();
    } catch {
      return '';
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

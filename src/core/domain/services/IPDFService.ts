// ============================================
// src/core/domain/services/IPDFService.ts
// Domain Service Interface: PDF operations
// ============================================

export interface PDFPageData {
  pageNumber: number;
  text: string;
  image: string | null;
}

/**
 * PDF service interface for extracting content from PDF files
 * Abstracts the underlying PDF processing library
 */
export interface IPDFService {
  /**
   * Extract text and images from a PDF file
   * @param file - PDF file to process
   * @returns Array of page data with text and images
   */
  extractFromPDF(file: File): Promise<PDFPageData[]>;

  /**
   * Extract only text from a PDF file
   * @param file - PDF file to process
   * @returns Array of text strings, one per page
   */
  extractTextFromPDF(file: File): Promise<string[]>;

  /**
   * Extract only images from a PDF file
   * @param file - PDF file to process
   * @returns Array of image URLs (data URLs or blob URLs)
   */
  extractImagesFromPDF(file: File): Promise<string[]>;

  /**
   * Get the number of pages in a PDF
   * @param file - PDF file to analyze
   * @returns Total number of pages
   */
  getPageCount(file: File): Promise<number>;
}

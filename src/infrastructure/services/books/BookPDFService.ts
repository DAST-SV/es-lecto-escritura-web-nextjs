/**
 * UBICACIÓN: src/infrastructure/services/BookPDFService.ts
 * ✅ Servicio para subir PDFs a Supabase Storage
 */

import { createClient } from '@/src/infrastructure/config/supabase.config';

const BUCKET_NAME = 'book-pdfs';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface UploadPDFResult {
  url: string | null;
  error: string | null;
}

export class BookPDFService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Subir PDF a Supabase Storage
   * @param file - Archivo PDF
   * @param userId - ID del usuario
   * @param bookId - ID del libro
   * @param languageCode - Código de idioma (opcional, para PDFs multi-idioma)
   */
  static async uploadPDF(
    file: File,
    userId: string,
    bookId: string,
    languageCode?: string
  ): Promise<UploadPDFResult> {
    try {
      const supabase = this.getSupabase();

      // Validar tipo
      if (file.type !== 'application/pdf') {
        return { url: null, error: 'Solo se permiten archivos PDF' };
      }

      // Validar tamaño
      if (file.size > MAX_FILE_SIZE) {
        return { url: null, error: 'El PDF es muy grande. Máximo 50MB' };
      }

      // Ruta: {userId}/{bookId}/document.pdf o {userId}/{bookId}/{lang}.pdf
      const fileName = languageCode ? `${languageCode}.pdf` : 'document.pdf';
      const filePath = `${userId}/${bookId}/${fileName}`;

      console.log('📤 Subiendo PDF:', filePath);

      // Subir archivo
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf'
        });

      if (error) {
        console.error('❌ Error subiendo PDF:', error);
        return { url: null, error: error.message };
      }

      // Guardar la ruta de storage (no URL pública ni firmada que expira)
      // Formato: storage://bucket/path para poder generar signed URLs bajo demanda
      const storageUrl = `storage://${BUCKET_NAME}/${filePath}`;
      console.log('✅ PDF subido:', storageUrl);

      return { url: storageUrl, error: null };

    } catch (error: any) {
      console.error('❌ Error en uploadPDF:', error);
      return { url: null, error: error.message || 'Error desconocido' };
    }
  }

  /**
   * Genera una signed URL a partir de una pdf_url almacenada.
   * Soporta:
   * - storage://bucket/path (formato nuevo)
   * - URL pública de Supabase (formato legacy, extrae el path)
   * - URLs externas (las retorna tal cual)
   */
  static async getSignedUrl(pdfUrl: string, expiresIn: number = 60 * 60): Promise<string> {
    const supabase = this.getSupabase();

    // Formato nuevo: storage://bucket/path
    if (pdfUrl.startsWith('storage://')) {
      const withoutProtocol = pdfUrl.replace('storage://', '');
      const bucketName = withoutProtocol.split('/')[0];
      const filePath = withoutProtocol.substring(bucketName.length + 1);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error || !data?.signedUrl) {
        throw new Error(`Error generando signed URL: ${error?.message || 'Unknown'}`);
      }
      return data.signedUrl;
    }

    // Formato legacy: URL pública de Supabase storage
    // Ejemplo: https://xxx.supabase.co/storage/v1/object/public/book-pdfs/userId/bookId/es.pdf
    const publicPattern = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;
    const match = pdfUrl.match(publicPattern);
    if (match) {
      const [, bucketName, filePath] = match;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error || !data?.signedUrl) {
        throw new Error(`Error generando signed URL: ${error?.message || 'Unknown'}`);
      }
      return data.signedUrl;
    }

    // URL ya firmada o externa: retornar tal cual
    return pdfUrl;
  }

  /**
   * Obtener URL pública de un PDF (legacy - puede no funcionar con buckets privados)
   */
  static getPublicUrl(userId: string, bookId: string): string {
    const supabase = this.getSupabase();
    const filePath = `${userId}/${bookId}/document.pdf`;

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Eliminar PDF
   */
  static async deletePDF(userId: string, bookId: string): Promise<boolean> {
    try {
      const supabase = this.getSupabase();
      const filePath = `${userId}/${bookId}/document.pdf`;

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('❌ Error eliminando PDF:', error);
        return false;
      }

      console.log('✅ PDF eliminado:', filePath);
      return true;

    } catch (error) {
      console.error('❌ Error en deletePDF:', error);
      return false;
    }
  }
}
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
   */
  static async uploadPDF(
    file: File,
    userId: string,
    bookId: string
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

      // Ruta: {userId}/{bookId}/document.pdf
      const filePath = `${userId}/${bookId}/document.pdf`;

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

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log('✅ PDF subido:', urlData.publicUrl);

      return { url: urlData.publicUrl, error: null };

    } catch (error: any) {
      console.error('❌ Error en uploadPDF:', error);
      return { url: null, error: error.message || 'Error desconocido' };
    }
  }

  /**
   * Obtener URL pública de un PDF
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
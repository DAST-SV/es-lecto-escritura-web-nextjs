import { createClient } from '@/src/utils/supabase/client';

export class BookPDFService {
  private static supabase = createClient();
  private static BUCKET_NAME = 'book-pdfs';
  private static MAX_FILE_SIZE = 50 * 1024 * 1024;

  static async uploadPDF(file: File, userId: string, bookId: string) {
    try {
      if (file.type !== 'application/pdf') {
        return { url: null, error: 'El archivo debe ser un PDF' };
      }
      if (file.size > this.MAX_FILE_SIZE) {
        return { url: null, error: 'El archivo excede 50MB' };
      }

      const filePath = `${userId}/${bookId}/document.pdf`;
      await this.supabase.storage.from(this.BUCKET_NAME).remove([filePath]);

      const { error: uploadError } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        return { url: null, error: uploadError.message };
      }

      const { data: { publicUrl } } = this.supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error: 'Error inesperado' };
    }
  }

  static getPublicUrl(userId: string, bookId: string): string {
    const filePath = `${userId}/${bookId}/document.pdf`;
    const { data: { publicUrl } } = this.supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);
    return publicUrl;
  }
}
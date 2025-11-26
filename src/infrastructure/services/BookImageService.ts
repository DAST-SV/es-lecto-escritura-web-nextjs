/**
 * UBICACIÓN: src/infrastructure/services/BookImageService.ts
 * 
 * Servicio para subir imágenes del libro a Supabase Storage
 * Maneja: portada, fondo de ficha, imágenes de página, fondos de página
 */

import { createClient } from '@/src/utils/supabase/client';

const BUCKET_NAME = 'libros'; // Asegúrate de crear este bucket en Supabase

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class BookImageService {
  private static supabase = createClient();

  /**
   * Sube una imagen a Supabase Storage
   */
  static async uploadImage(
    file: Blob | File,
    userId: string,
    bookId: string,
    imageType: 'portada' | 'pagina' | 'fondo' | 'card-background',
    pageNumber?: number
  ): Promise<UploadResult> {
    try {
      // Generar nombre único
      const timestamp = Date.now();
      const extension = file instanceof File ? file.name.split('.').pop() : 'jpg';
      
      let fileName: string;
      if (imageType === 'portada') {
        fileName = `${userId}/${bookId}/portada_${timestamp}.${extension}`;
      } else if (imageType === 'card-background') {
        fileName = `${userId}/${bookId}/card_background_${timestamp}.${extension}`;
      } else if (imageType === 'pagina' && pageNumber !== undefined) {
        fileName = `${userId}/${bookId}/paginas/pagina_${pageNumber}_${timestamp}.${extension}`;
      } else if (imageType === 'fondo' && pageNumber !== undefined) {
        fileName = `${userId}/${bookId}/fondos/fondo_${pageNumber}_${timestamp}.${extension}`;
      } else {
        fileName = `${userId}/${bookId}/misc_${timestamp}.${extension}`;
      }

      // Subir archivo
      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });

      if (error) {
        console.error('❌ Error subiendo imagen:', error);
        return { success: false, error: error.message };
      }

      // Obtener URL pública
      const { data: urlData } = this.supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log('✅ Imagen subida:', urlData.publicUrl);
      
      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('❌ Error en uploadImage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sube todas las imágenes de un libro y retorna las URLs actualizadas
   */
  static async uploadAllBookImages(
    userId: string,
    bookId: string,
    data: {
      portadaFile?: File | Blob | null;
      cardBackgroundFile?: File | Blob | null;
      pages: Array<{
        file?: Blob | null;          // Imagen de contenido
        backgroundFile?: Blob | null; // Imagen de fondo
        image?: string | null;        // URL actual
        background?: string | null;   // Fondo actual
      }>;
    }
  ): Promise<{
    portadaUrl: string | null;
    cardBackgroundUrl: string | null;
    pages: Array<{
      imageUrl: string | null;
      backgroundUrl: string | null;
    }>;
  }> {
    const results = {
      portadaUrl: null as string | null,
      cardBackgroundUrl: null as string | null,
      pages: [] as Array<{ imageUrl: string | null; backgroundUrl: string | null }>
    };

    // 1. Subir portada si hay archivo nuevo
    if (data.portadaFile) {
      const result = await this.uploadImage(data.portadaFile, userId, bookId, 'portada');
      if (result.success && result.url) {
        results.portadaUrl = result.url;
      }
    }

    // 2. Subir fondo de ficha si hay archivo nuevo
    if (data.cardBackgroundFile) {
      const result = await this.uploadImage(data.cardBackgroundFile, userId, bookId, 'card-background');
      if (result.success && result.url) {
        results.cardBackgroundUrl = result.url;
      }
    }

    // 3. Subir imágenes de cada página
    for (let i = 0; i < data.pages.length; i++) {
      const page = data.pages[i];
      const pageResult = { imageUrl: null as string | null, backgroundUrl: null as string | null };

      // Imagen de contenido
      if (page.file) {
        const result = await this.uploadImage(page.file, userId, bookId, 'pagina', i + 1);
        if (result.success && result.url) {
          pageResult.imageUrl = result.url;
        }
      } else if (page.image && !page.image.startsWith('blob:')) {
        // Mantener URL existente si no es blob
        pageResult.imageUrl = page.image;
      }

      // Fondo de página (si es imagen, no color)
      if (page.backgroundFile) {
        const result = await this.uploadImage(page.backgroundFile, userId, bookId, 'fondo', i + 1);
        if (result.success && result.url) {
          pageResult.backgroundUrl = result.url;
        }
      } else if (page.background && 
                 typeof page.background === 'string' && 
                 !page.background.startsWith('blob:') &&
                 (page.background.startsWith('http') || page.background.startsWith('#'))) {
        // Mantener URL o color existente
        pageResult.backgroundUrl = page.background;
      }

      results.pages.push(pageResult);
    }

    return results;
  }

  /**
   * Elimina todas las imágenes de un libro
   */
  static async deleteBookImages(userId: string, bookId: string): Promise<void> {
    try {
      const folderPath = `${userId}/${bookId}`;
      
      // Listar todos los archivos en la carpeta del libro
      const { data: files, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .list(folderPath, { limit: 1000 });

      if (error) {
        console.error('Error listando archivos:', error);
        return;
      }

      if (files && files.length > 0) {
        const filesToDelete = files.map(file => `${folderPath}/${file.name}`);
        
        const { error: deleteError } = await this.supabase.storage
          .from(BUCKET_NAME)
          .remove(filesToDelete);

        if (deleteError) {
          console.error('Error eliminando archivos:', deleteError);
        }
      }
    } catch (error) {
      console.error('Error en deleteBookImages:', error);
    }
  }

  /**
   * Verifica si una URL es temporal (blob:)
   */
  static isTempUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.startsWith('blob:');
  }

  /**
   * Verifica si una URL es permanente (http/https)
   */
  static isPermanentUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }
}
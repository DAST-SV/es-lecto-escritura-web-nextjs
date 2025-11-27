/**
 * UBICACIÓN: src/infrastructure/services/BookImageService.ts
 * ✅ ACTUALIZADO: Usa el nuevo bucket 'book-images'
 * 
 * Servicio para subir imágenes del libro a Supabase Storage
 * Maneja: portada, fondo de ficha, imágenes de página, fondos de página
 */

import { createClient } from '@/src/utils/supabase/client';

// ✅ NUEVO BUCKET
const BUCKET_NAME = 'book-images';

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
      
      // Estructura de carpetas:
      // book-images/
      //   {userId}/
      //     {bookId}/
      //       covers/       - portadas y fondos de ficha
      //       pages/        - imágenes de contenido
      //       backgrounds/  - fondos de página
      
      if (imageType === 'portada') {
        fileName = `${userId}/${bookId}/covers/cover_${timestamp}.${extension}`;
      } else if (imageType === 'card-background') {
        fileName = `${userId}/${bookId}/covers/card_bg_${timestamp}.${extension}`;
      } else if (imageType === 'pagina' && pageNumber !== undefined) {
        fileName = `${userId}/${bookId}/pages/page_${pageNumber}_${timestamp}.${extension}`;
      } else if (imageType === 'fondo' && pageNumber !== undefined) {
        fileName = `${userId}/${bookId}/backgrounds/bg_${pageNumber}_${timestamp}.${extension}`;
      } else {
        fileName = `${userId}/${bookId}/misc/misc_${timestamp}.${extension}`;
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
      console.log('📤 Subiendo portada...');
      const result = await this.uploadImage(data.portadaFile, userId, bookId, 'portada');
      if (result.success && result.url) {
        results.portadaUrl = result.url;
        console.log('✅ Portada subida:', result.url);
      }
    }

    // 2. Subir fondo de ficha si hay archivo nuevo
    if (data.cardBackgroundFile) {
      console.log('📤 Subiendo fondo de ficha...');
      const result = await this.uploadImage(data.cardBackgroundFile, userId, bookId, 'card-background');
      if (result.success && result.url) {
        results.cardBackgroundUrl = result.url;
        console.log('✅ Fondo de ficha subido:', result.url);
      }
    }

    // 3. Subir imágenes de cada página
    console.log(`📤 Subiendo ${data.pages.length} páginas...`);
    
    for (let i = 0; i < data.pages.length; i++) {
      const page = data.pages[i];
      const pageResult = { imageUrl: null as string | null, backgroundUrl: null as string | null };

      // Imagen de contenido
      if (page.file) {
        console.log(`📤 Subiendo imagen página ${i + 1}...`);
        const result = await this.uploadImage(page.file, userId, bookId, 'pagina', i + 1);
        if (result.success && result.url) {
          pageResult.imageUrl = result.url;
          console.log(`✅ Imagen página ${i + 1} subida:`, result.url);
        }
      } else if (page.image && !page.image.startsWith('blob:')) {
        // Mantener URL existente si no es blob
        pageResult.imageUrl = page.image;
      }

      // Fondo de página (si es imagen, no color)
      if (page.backgroundFile) {
        console.log(`📤 Subiendo fondo página ${i + 1}...`);
        const result = await this.uploadImage(page.backgroundFile, userId, bookId, 'fondo', i + 1);
        if (result.success && result.url) {
          pageResult.backgroundUrl = result.url;
          console.log(`✅ Fondo página ${i + 1} subido:`, result.url);
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

    console.log('✅ Todas las imágenes procesadas:', {
      portada: !!results.portadaUrl,
      cardBackground: !!results.cardBackgroundUrl,
      pagesWithImages: results.pages.filter(p => p.imageUrl).length,
      pagesWithBackgrounds: results.pages.filter(p => p.backgroundUrl).length,
    });

    return results;
  }

  /**
   * Elimina todas las imágenes de un libro
   */
  static async deleteBookImages(userId: string, bookId: string): Promise<void> {
    try {
      const folderPath = `${userId}/${bookId}`;
      
      console.log(`🗑️ Eliminando imágenes de: ${folderPath}`);
      
      // Listar todos los archivos en la carpeta del libro
      const { data: files, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .list(folderPath, { 
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Error listando archivos:', error);
        return;
      }

      if (files && files.length > 0) {
        // Construir rutas completas
        const filesToDelete = files.map(file => `${folderPath}/${file.name}`);
        
        console.log(`🗑️ Eliminando ${filesToDelete.length} archivos...`);
        
        const { error: deleteError } = await this.supabase.storage
          .from(BUCKET_NAME)
          .remove(filesToDelete);

        if (deleteError) {
          console.error('Error eliminando archivos:', deleteError);
        } else {
          console.log('✅ Imágenes eliminadas correctamente');
        }
      } else {
        console.log('ℹ️ No hay imágenes para eliminar');
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

  /**
   * Verifica si una cadena es un color (hex o preset)
   */
  static isColor(value: string | null | undefined): boolean {
    if (!value) return false;
    // Color hex o nombre de preset (sin http/blob)
    return value.startsWith('#') || (!value.startsWith('http') && !value.startsWith('blob:'));
  }
}
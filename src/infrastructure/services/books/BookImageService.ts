/**
 * UBICACIÓN: src/infrastructure/services/BookImageService.ts
 * ✅ CORREGIDO: Mejor manejo de errores y verificación de bucket
 */

import { createClient } from '@/src/infrastructure/config/supabase.config';

const BUCKET_NAME = 'book-images';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export class BookImageService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Verifica si el bucket existe y está accesible
   */
  static async checkBucket(): Promise<boolean> {
    try {
      const supabase = this.getSupabase();
      
      // Intentar listar archivos en el bucket (forma más fiable de verificar)
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (error) {
        // Si el error es "not found", el bucket no existe
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          console.warn(`⚠️ Bucket '${BUCKET_NAME}' no existe. Crearlo manualmente en Supabase Dashboard.`);
          return false;
        }
        // Otros errores pueden ser de permisos pero el bucket existe
        console.warn(`⚠️ Bucket '${BUCKET_NAME}' puede existir pero hay error de acceso:`, error.message);
        return true; // Intentamos de todos modos
      }
      
      console.log(`✅ Bucket '${BUCKET_NAME}' disponible`);
      return true;
    } catch (e) {
      console.error('Error verificando bucket:', e);
      return false;
    }
  }

  /**
   * Sube una imagen a Supabase Storage
   */
  static async uploadImage(
    file: Blob | File,
    userId: string,
    bookId: string,
    imageType: 'portada' | 'pagina' | 'fondo' | 'card-background' | string,
    pageNumber?: number
  ): Promise<UploadResult> {
    try {
      const supabase = this.getSupabase();

      // Generar nombre único
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const extension = file instanceof File
        ? file.name.split('.').pop()?.toLowerCase() || 'jpg'
        : 'jpg';

      let fileName: string;

      // Estructura de carpetas:
      // book-images/{userId}/{bookId}/covers/
      // book-images/{userId}/{bookId}/pages/
      // book-images/{userId}/{bookId}/backgrounds/

      // Portada por idioma: portada-es, portada-en, etc.
      if (imageType === 'portada' || imageType.startsWith('portada-')) {
        const langSuffix = imageType.includes('-') ? `_${imageType.split('-')[1]}` : '';
        fileName = `${userId}/${bookId}/covers/cover${langSuffix}_${timestamp}_${randomStr}.${extension}`;
      } else if (imageType === 'card-background') {
        fileName = `${userId}/${bookId}/covers/card_bg_${timestamp}_${randomStr}.${extension}`;
      } else if (imageType === 'pagina') {
        fileName = `${userId}/${bookId}/pages/page_${pageNumber || 0}_${timestamp}_${randomStr}.${extension}`;
      } else if (imageType === 'fondo') {
        fileName = `${userId}/${bookId}/backgrounds/bg_${pageNumber || 0}_${timestamp}_${randomStr}.${extension}`;
      } else {
        fileName = `${userId}/${bookId}/misc/misc_${timestamp}_${randomStr}.${extension}`;
      }

      console.log(`📤 Subiendo imagen: ${fileName} (${(file.size / 1024).toFixed(1)}KB)`);

      // Subir archivo
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });

      if (error) {
        console.error('❌ Error subiendo imagen:', error);
        return { 
          success: false, 
          error: `Error al subir imagen: ${error.message}` 
        };
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('✅ Imagen subida:', publicUrl);
      
      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('❌ Error en uploadImage:', error);
      return { 
        success: false, 
        error: error.message || 'Error desconocido al subir imagen' 
      };
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
    console.log('📸 BookImageService.uploadAllBookImages - Iniciando');
    console.log('👤 Usuario:', userId);
    console.log('📖 Libro:', bookId);
    console.log('📄 Páginas:', data.pages.length);

    const results = {
      portadaUrl: null as string | null,
      cardBackgroundUrl: null as string | null,
      pages: [] as Array<{ imageUrl: string | null; backgroundUrl: string | null }>
    };

    // Verificar bucket
    const bucketExists = await this.checkBucket();
    if (!bucketExists) {
      console.warn('⚠️ Bucket no disponible, las imágenes NO se subirán');
      console.warn('⚠️ Crear bucket "book-images" manualmente en Supabase Dashboard > Storage');
      
      // Retornar estructura con URLs existentes pero sin subir nada nuevo
      results.pages = data.pages.map(page => ({
        imageUrl: this.isPermanentUrl(page.image) ? page.image! : null,
        backgroundUrl: this.isPermanentUrl(page.background) ? page.background! : null,
      }));
      return results;
    }

    // 1. Subir portada si hay archivo nuevo
    if (data.portadaFile) {
      console.log('📤 Subiendo portada...');
      const result = await this.uploadImage(data.portadaFile, userId, bookId, 'portada');
      if (result.success && result.url) {
        results.portadaUrl = result.url;
        console.log('✅ Portada subida:', result.url);
      } else {
        console.error('❌ Error subiendo portada:', result.error);
      }
    }

    // 2. Subir fondo de ficha si hay archivo nuevo
    if (data.cardBackgroundFile) {
      console.log('📤 Subiendo fondo de ficha...');
      const result = await this.uploadImage(data.cardBackgroundFile, userId, bookId, 'card-background');
      if (result.success && result.url) {
        results.cardBackgroundUrl = result.url;
        console.log('✅ Fondo de ficha subido:', result.url);
      } else {
        console.error('❌ Error subiendo fondo de ficha:', result.error);
      }
    }

    // 3. Subir imágenes de cada página
    console.log(`📤 Procesando ${data.pages.length} páginas...`);
    
    for (let i = 0; i < data.pages.length; i++) {
      const page = data.pages[i];
      const pageResult = { 
        imageUrl: null as string | null, 
        backgroundUrl: null as string | null 
      };

      // Imagen de contenido
      if (page.file) {
        console.log(`📤 Subiendo imagen página ${i + 1}...`);
        const result = await this.uploadImage(page.file, userId, bookId, 'pagina', i + 1);
        if (result.success && result.url) {
          pageResult.imageUrl = result.url;
          console.log(`✅ Imagen página ${i + 1} subida`);
        } else {
          console.error(`❌ Error subiendo imagen página ${i + 1}:`, result.error);
        }
      } else if (page.image && this.isPermanentUrl(page.image)) {
        // Mantener URL existente si es permanente
        pageResult.imageUrl = page.image;
      }

      // Fondo de página (si es imagen, no color)
      if (page.backgroundFile) {
        console.log(`📤 Subiendo fondo página ${i + 1}...`);
        const result = await this.uploadImage(page.backgroundFile, userId, bookId, 'fondo', i + 1);
        if (result.success && result.url) {
          pageResult.backgroundUrl = result.url;
          console.log(`✅ Fondo página ${i + 1} subido`);
        } else {
          console.error(`❌ Error subiendo fondo página ${i + 1}:`, result.error);
        }
      } else if (page.background && this.isPermanentUrl(page.background)) {
        // Mantener URL existente
        pageResult.backgroundUrl = page.background;
      } else if (page.background && this.isColor(page.background)) {
        // Mantener color
        pageResult.backgroundUrl = page.background;
      }

      results.pages.push(pageResult);
    }

    console.log('✅ Procesamiento de imágenes completado:', {
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
      const supabase = this.getSupabase();
      const folderPath = `${userId}/${bookId}`;
      
      console.log(`🗑️ Eliminando imágenes de: ${folderPath}`);

      // Listar archivos en subcarpetas
      const subfolders = ['covers', 'pages', 'backgrounds', 'misc'];
      
      for (const subfolder of subfolders) {
        const { data: files, error: listError } = await supabase.storage
          .from(BUCKET_NAME)
          .list(`${folderPath}/${subfolder}`, { limit: 1000 });

        if (listError) {
          console.warn(`⚠️ Error listando ${subfolder}:`, listError.message);
          continue;
        }

        if (files && files.length > 0) {
          const filesToDelete = files.map(file => `${folderPath}/${subfolder}/${file.name}`);
          
          console.log(`🗑️ Eliminando ${filesToDelete.length} archivos de ${subfolder}...`);
          
          const { error: deleteError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove(filesToDelete);

          if (deleteError) {
            console.error(`❌ Error eliminando archivos de ${subfolder}:`, deleteError.message);
          }
        }
      }

      console.log('✅ Limpieza de imágenes completada');
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
    return value.startsWith('#') || 
           (!value.startsWith('http') && !value.startsWith('blob:'));
  }
}

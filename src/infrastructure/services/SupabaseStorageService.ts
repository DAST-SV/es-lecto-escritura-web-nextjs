/**
 * UBICACIÓN: src/infrastructure/services/SupabaseStorageService.ts
 * 
 * Implementación del servicio de storage usando Supabase
 */

import { IStorageService } from '../../core/application/ports/IStorageService';

export class SupabaseStorageService implements IStorageService {
  
  async uploadFile(
    file: Blob | File,
    bucket: string,
    path: string
  ): Promise<string> {
    try {
      // Usar la función existente de uploadFile
      const { uploadFile } = await import('@/src/utils/supabase/storageService');
      return await uploadFile(file, bucket, path);
    } catch (error) {
      console.error('Error en SupabaseStorageService.uploadFile:', error);
      throw error;
    }
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { removeFile } = await import('@/src/utils/supabase/storageService');
      await removeFile(bucket, path);
    } catch (error) {
      console.error('Error en SupabaseStorageService.deleteFile:', error);
      throw error;
    }
  }

  async deleteFolder(
    bucket: string,
    folderPath: string
  ): Promise<{ removed: string[] }> {
    try {
      const { removeFolder } = await import('@/src/utils/supabase/storageService');
      return await removeFolder(bucket, folderPath);
    } catch (error) {
      console.error('Error en SupabaseStorageService.deleteFolder:', error);
      throw error;
    }
  }

  generateFilePath(userId: string, bookId: string, filename: string): string {
    return `${userId}/${bookId}/${filename}`;
  }

  getPublicUrl(bucket: string, path: string): string {
    // Implementar según tu configuración de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  }

  async fileExists(bucket: string, path: string): Promise<boolean> {
    try {
      // Intentar obtener la URL del archivo
      const url = this.getPublicUrl(bucket, path);
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
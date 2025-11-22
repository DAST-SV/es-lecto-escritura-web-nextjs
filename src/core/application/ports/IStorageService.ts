/**
 * UBICACIÓN: src/core/application/ports/IStorageService.ts
 * 
 * Puerto para servicios de almacenamiento de archivos
 */

export interface IStorageService {
  uploadFile(file: Blob | File, bucket: string, path: string): Promise<string>;
  deleteFile(bucket: string, path: string): Promise<void>;
  deleteFolder(bucket: string, folderPath: string): Promise<{ removed: string[] }>;
  generateFilePath(userId: string, bookId: string, filename: string): string;
  getPublicUrl(bucket: string, path: string): string;
  fileExists(bucket: string, path: string): Promise<boolean>;
}
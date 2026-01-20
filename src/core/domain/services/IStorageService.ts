// ============================================
// src/core/domain/services/IStorageService.ts
// Domain Service Interface: Storage abstraction
// ============================================

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export type ImageType = 'portada' | 'pagina' | 'fondo' | 'card-background' | 'profile' | 'organization';

/**
 * Storage service interface for managing file uploads and deletions
 * Abstracts the underlying storage implementation (Supabase, S3, etc.)
 */
export interface IStorageService {
  /**
   * Check if the storage bucket is available and accessible
   */
  checkBucket(bucketName: string): Promise<boolean>;

  /**
   * Upload a single file to storage
   * @param file - File or Blob to upload
   * @param userId - ID of the user uploading the file
   * @param resourceId - ID of the resource (book, organization, etc.)
   * @param imageType - Type of image being uploaded
   * @param pageNumber - Optional page number for paginated content
   * @returns Upload result with success status and URL
   */
  uploadFile(
    file: Blob | File,
    userId: string,
    resourceId: string,
    imageType: ImageType,
    pageNumber?: number
  ): Promise<UploadResult>;

  /**
   * Delete all files for a specific resource
   * @param userId - ID of the user who owns the files
   * @param resourceId - ID of the resource
   */
  deleteResourceFiles(userId: string, resourceId: string): Promise<void>;

  /**
   * Get public URL for a file path
   * @param filePath - Path to the file in storage
   * @returns Public URL to access the file
   */
  getPublicUrl(filePath: string): string;

  /**
   * Check if a URL is temporary (blob:)
   */
  isTempUrl(url: string | null | undefined): boolean;

  /**
   * Check if a URL is permanent (http/https)
   */
  isPermanentUrl(url: string | null | undefined): boolean;

  /**
   * Check if a value is a color (not a URL)
   */
  isColor(value: string | null | undefined): boolean;
}

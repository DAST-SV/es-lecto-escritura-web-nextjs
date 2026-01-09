// ============================================
// 12. src/infrastructure/services/storage/SupabaseStorageService.ts
// ============================================
import { createClient } from '@/src/infrastructure/config/supabase.config';

export class SupabaseStorageService {
  private supabase = createClient();

  async uploadFile(file: File | Blob, bucket: string, path: string, upsert: boolean = true): Promise<string> {
    if (upsert) {
      await this.supabase.storage.from(bucket).remove([path]);
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, { upsert });

    if (error) throw error;

    const { data: publicData } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return publicData.publicUrl;
  }

  getPublicFileUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  generateFilePath(userId: string, folder: string | undefined, fileName: string): string {
    const timestamp = Date.now();
    const dotIndex = fileName.lastIndexOf(".");
    const baseName = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;
    const extension = dotIndex !== -1 ? fileName.substring(dotIndex) : "";
    const uniqueFileName = `${baseName}-${timestamp}${extension}`;

    return folder 
      ? `${userId}/${folder}/${uniqueFileName}`
      : `${userId}/${uniqueFileName}`;
  }

  async removeFolder(bucket: string, folderPath: string) {
    const cleanPath = folderPath.endsWith("/") ? folderPath : folderPath + "/";
    let allFiles: string[] = [];

    async function recursiveList(prefix: string, supabase: any) {
      const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
      if (error) throw error;

      for (const item of data || []) {
        const fullPath = prefix + item.name;
        if (item.id) {
          allFiles.push(fullPath);
        } else {
          await recursiveList(fullPath + "/", supabase);
        }
      }
    }

    await recursiveList(cleanPath, this.supabase);

    if (allFiles.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < allFiles.length; i += batchSize) {
        const batch = allFiles.slice(i, i + batchSize);
        const { error } = await this.supabase.storage.from(bucket).remove(batch);
        if (error) throw error;
      }
    }

    return { success: true, removed: allFiles.length, files: allFiles };
  }
}
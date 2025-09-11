import { createClient } from '@/src/utils/supabase/client'

// ---------------------
// Funciones genéricas
// ---------------------
  const supabase = await createClient()
/**
 * Subir un archivo a Supabase Storage y obtener la URL pública
 * @param file Archivo a subir (File o Blob)
 * @param bucket Nombre del bucket
 * @param path Path dentro del bucket (puede incluir carpetas virtuales)
 * @param upsert Si true, sobrescribe archivo existente
 * @returns URL pública del archivo
 */
export const uploadFile = async (
    file: File | Blob,
    bucket: string,
    path: string,
    upsert: boolean = true
): Promise<string> => {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert });

    if (error) throw error;

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicData.publicUrl;
};

/**
 * Obtener URL pública de un archivo existente en Supabase Storage
 * @param bucket Nombre del bucket
 * @param path Path completo dentro del bucket
 * @returns URL pública del archivo
 */
export const getPublicFileUrl = (bucket: string, path: string): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
};

/**
 * Generar un path seguro para subir archivos
 * @param userId Id del usuario
 * @param folder Nombre de carpeta dentro del bucket (opcional)
 * @param fileName Nombre del archivo
 * @returns Path completo
 */
export const generateFilePath = (
    userId: string,
    folder: string | undefined,
    fileName: string
): string => {
    return folder ? `${userId}/${folder}/${fileName}` : `${userId}/${fileName}`;
};

/**
 * Obtener extensión de un archivo (File o Blob)
 * @param file File o Blob
 * @returns Extensión como string
 */
export const getFileExtension = (file: File | Blob): string => {
    if (file instanceof File) {
        return file.name.split('.').pop() || "bin";
    } else {
        const mimeParts = file.type.split('/');
        return mimeParts[1] || "bin";
    }
};

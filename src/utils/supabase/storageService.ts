import { createClient } from '@/src/utils/supabase/client'

/**
 * Crear instancia de Supabase
 */
const supabase = await createClient();

/**
 * Subir un archivo a Supabase Storage y obtener la URL pública
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
 */
export const getPublicFileUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Generar un path seguro para subir archivos
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
 */
export const getFileExtension = (file: File | Blob): string => {
  if (file instanceof File) {
    return file.name.split('.').pop() || "bin";
  } else {
    const mimeParts = file.type.split('/');
    return mimeParts[1] || "bin";
  }
};

/**
 * Elimina todos los archivos dentro de un folder de Supabase Storage, recursivamente
 */
export const removeFolder = async (bucket: string, folderPath: string) => {
    
  // Asegurar que la ruta termina con "/"
  const cleanPath = folderPath.endsWith("/") ? folderPath : folderPath + "/";

  let allFiles: string[] = [];

  // Función recursiva para listar todos los archivos dentro de prefijos
  async function recursiveList(prefix: string) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
    });

    if (error) throw error;

    for (const item of data || []) {
      if ('metadata' in item && item.metadata) {
        // Es archivo
        allFiles.push(prefix + item.name);
      } else if ('name' in item && item.name) {
        // Es “carpeta” → seguir bajando
        await recursiveList(prefix + item.name + "/");
      }
    }
  }

  await recursiveList(cleanPath);

  if (allFiles.length > 0) {
    const { error: removeError } = await supabase.storage.from(bucket).remove(allFiles);
    if (removeError) throw removeError;
  }

  return { success: true, removed: allFiles.length };
};

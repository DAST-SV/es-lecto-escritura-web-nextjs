import { supabaseAdmin } from '@/src/utils/supabase/admin'

/**
 * Crear instancia de Supabase
 */
const supabase =  supabaseAdmin;

/**
 * Subir un archivo a Supabase Storage y obtener la URL pública
 */
export const uploadFile = async (
  file: File | Blob,
  bucket: string,
  path: string,
  upsert: boolean = true
): Promise<string> => {
  if (upsert) {
    // 🔹 Intentar eliminar antes de subir
    await supabase.storage.from(bucket).remove([path]);
  }

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
  const timestamp = Date.now();
  

  // Separar nombre y extensión
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;
  const extension = dotIndex !== -1 ? fileName.substring(dotIndex) : "";

  const uniqueFileName = `${baseName}-${timestamp}${extension}`;

  return folder 
    ? `${userId}/${folder}/${uniqueFileName}`
    : `${userId}/${uniqueFileName}`;
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
/**
 * Elimina todos los archivos dentro de un folder de Supabase Storage, recursivamente
 */
/**
 * Elimina todos los archivos dentro de un folder de Supabase Storage, recursivamente
 */
export const removeFolder = async (bucket: string, folderPath: string) => {
  // Asegurar que la ruta termina con "/"
  const cleanPath = folderPath.endsWith("/") ? folderPath : folderPath + "/";

  let allFiles: string[] = [];

  // Función recursiva para listar todos los archivos dentro de prefijos
  async function recursiveList(prefix: string) {
    console.log(`🔍 Listando contenido en: ${prefix}`);
    
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
    });

    if (error) throw error;

    console.log(`📁 Encontrados ${data?.length || 0} items en ${prefix}`);

    for (const item of data || []) {
      const fullPath = prefix + item.name;
      
      console.log(`📄 Item: ${item.name}, tiene ID: ${!!item.id}`);
      
      // En Supabase, los archivos tienen un 'id' y las carpetas no
      if (item.id) {
        // Es un archivo
        console.log(`✅ Agregando archivo: ${fullPath}`);
        allFiles.push(fullPath);
      } else {
        // Es una "carpeta" → seguir bajando recursivamente
        console.log(`📁 Entrando a carpeta: ${fullPath}`);
        await recursiveList(fullPath + "/");
      }
    }
  }

  await recursiveList(cleanPath);

  // Eliminar archivos en lotes para evitar problemas con listas muy grandes
  if (allFiles.length > 0) {
    console.log(`🗑️ Intentando eliminar ${allFiles.length} archivos...`);
    console.log("Archivos a eliminar:", allFiles);
    
    // Supabase tiene un límite en el número de archivos que se pueden eliminar de una vez
    const batchSize = 100;
    
    for (let i = 0; i < allFiles.length; i += batchSize) {
      const batch = allFiles.slice(i, i + batchSize);
      console.log(`🔥 Eliminando lote ${Math.floor(i/batchSize) + 1}:`, batch);
      
      const { data: removeData, error: removeError } = await supabase.storage.from(bucket).remove(batch);
      
      console.log("Resultado de eliminación:", { removeData, removeError });
      
      if (removeError) {
        console.error("❌ Error al eliminar:", removeError);
        throw removeError;
      } else {
        console.log("✅ Lote eliminado exitosamente");
      }
    }
  } else {
    console.log("⚠️ No se encontraron archivos para eliminar");
  }

  // Verificar que los archivos se eliminaron
  console.log("🔍 Verificando eliminación...");
  await recursiveList(cleanPath);
  console.log(`📊 Archivos restantes después de eliminación: ${allFiles.length}`);
  console.log( await verifyDeletion(bucket,folderPath))

  return { success: true, removed: allFiles.length, files: allFiles };
};

// Función para verificar archivos restantes
const verifyDeletion = async (bucket: string, folderPath: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folderPath);
  
  console.log("Archivos restantes:", data);
  return data;
};
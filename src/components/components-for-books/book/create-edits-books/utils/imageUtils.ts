/* Crea una imagen de vista previa en canvas para validación
 * @param file - Archivo de imagen
 * @param maxWidth - Ancho máximo para la vista previa
 * @param maxHeight - Alto máximo para la vista previa
 * @returns Promise que resuelve con un elemento canvas
 /**/
export const createImagePreview = (file: File, maxWidth: number = 200, maxHeight: number = 200): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        return reject(new Error("No se pudo leer el archivo"));
      }
      img.src = e.target.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calcular dimensiones para vista previa
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("No se pudo obtener contexto del canvas"));
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas);
    };

    img.onerror = () => reject(new Error("Error al cargar la imagen"));
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
};

/**
 * Utilidades para el manejo de imágenes y archivos
 */

/**
 * Redimensiona una imagen manteniendo las proporciones
 * @param file - Archivo de imagen a redimensionar
 * @param maxWidth - Ancho máximo
 * @param maxHeight - Alto máximo
 * @returns Promise que resuelve con el Blob redimensionado
 */
export function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        return reject(new Error("No se pudo leer el archivo"));
      }
      img.src = e.target.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calcular nuevas dimensiones manteniendo proporciones
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("No se pudo obtener contexto del canvas"));
      }

      // Dibujar la imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a Blob con compresión JPEG
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("No se pudo crear el Blob"));
          }
        },
        "image/jpeg",
        0.8 // Calidad de compresión
      );
    };

    img.onerror = () => reject(new Error("Error al cargar la imagen"));
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Descarga un archivo desde una URL y lo convierte en Blob
 * @param url - URL del archivo a descargar
 * @returns Promise que resuelve con el Blob o null si hay error
 */
export const fetchFileFromUrl = async (url: string): Promise<Blob | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Error fetching file from URL: ${response.statusText}`);
      return null;
    }
    return await response.blob();
  } catch (error) {
    console.error("Error fetching file from URL:", error);
    return null;
  }
};

/**
 * Obtiene la extensión de archivo desde un File o Blob
 * @param file - Archivo del cual obtener la extensión
 * @returns Extensión del archivo (sin el punto)
 */
export const getFileExtension = (file: Blob | File): string => {
  if (file instanceof File) {
    const parts = file.name.split('.');
    return parts.length > 1 ? parts.pop() || "bin" : "bin";
  } else {
    // Extraer extensión del MIME type: "image/jpeg" -> "jpeg"
    const mimeParts = file.type.split('/');
    return mimeParts.length > 1 ? mimeParts[1] : "bin";
  }
};

/**
 * Valida si un archivo es una imagen válida
 * @param file - Archivo a validar
 * @returns true si es una imagen válida
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

/**
 * Convierte bytes a formato legible (KB, MB, etc.)
 * @param bytes - Cantidad de bytes
 * @returns String con el tamaño formateado
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Libera una URL de blob de la memoria
 * @param url - URL del blob a liberar
 */
export const revokeBlobUrl = (url: string | null): void => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**/
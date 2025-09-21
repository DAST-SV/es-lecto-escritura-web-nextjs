import { useCallback } from 'react';
import toast from 'react-hot-toast';
import type { page } from '@/src/typings/types-page-book/index';

interface UseImageHandlerProps {
  pages: page[];
  currentPage: number;
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
}

export interface UseImageHandlerReturn {
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeImage: () => void;
  handleBackgroundFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeBackground: () => void;
  resizeImage: (file: File, maxWidth: number, maxHeight: number) => Promise<Blob>;
  fetchFileFromUrl: (url: string) => Promise<Blob | null>;
  getFileExtension: (file: Blob | File) => string;
}

// Función para redimensionar imágenes
function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) return reject("No se pudo leer el archivo");
      img.src = e.target.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Mantener proporciones
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
      if (!ctx) return reject("No se pudo obtener contexto del canvas");

      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a Blob (JPEG con calidad 0.8)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject("No se pudo crear el Blob");
        },
        "image/jpeg",
        0.8
      );
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Función para obtener archivo desde URL
const fetchFileFromUrl = async (url: string): Promise<Blob | null> => {
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

// Función para obtener extensión de archivo
const getFileExtension = (file: Blob | File): string => {
  if (file instanceof File) {
    return file.name.split('.').pop() || "bin";
  } else {
    // extraemos del type MIME, ej: "image/jpeg" -> "jpeg"
    const mimeParts = file.type.split('/');
    return mimeParts[1] || "bin";
  }
};

export const useImageHandler = ({
  pages,
  currentPage,
  setPages
}: UseImageHandlerProps): UseImageHandlerReturn => {

  // Handler para cambio de imagen principal
  const handleImageChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const resizedBlob = await resizeImage(file, 800, 800);
        const previewUrl = URL.createObjectURL(resizedBlob);

        setPages(prev => {
          const updated = [...prev];
          const currentPageData = updated[currentPage];

          // Liberar URL anterior si existe para evitar memory leaks
          if (currentPageData.image && currentPageData.image.startsWith('blob:')) {
            URL.revokeObjectURL(currentPageData.image);
          }

          updated[currentPage] = {
            ...currentPageData,
            image: previewUrl,
            file: resizedBlob
          };
          return updated;
        });
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
        toast.error("Error al procesar la imagen");
      }
    },
    [currentPage, setPages]
  );

  // Función para remover imagen
  const removeImage = useCallback(() => {
    setPages(prev => {
      const updated = [...prev];
      const currentPageData = updated[currentPage];

      // Liberar memoria del blob URL si existe
      if (currentPageData.image && currentPageData.image.startsWith('blob:')) {
        URL.revokeObjectURL(currentPageData.image);
      }

      // Limpiar tanto la URL como el archivo
      updated[currentPage] = {
        ...currentPageData,
        image: null,
        file: null
      };

      return updated;
    });
  }, [currentPage, setPages]);

  // Handler para archivo de fondo
  const handleBackgroundFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const resizedBlob = await resizeImage(file, 1920, 1080);
        const previewUrl = URL.createObjectURL(resizedBlob);

        setPages(prev => {
          const updated = [...prev];
          const currentPageData = updated[currentPage];

          // Liberar URL anterior si existe
          if (currentPageData.background &&
            typeof currentPageData.background === 'string' &&
            currentPageData.background.startsWith('blob:')) {
            URL.revokeObjectURL(currentPageData.background);
          }

          updated[currentPage] = {
            ...currentPageData,
            background: previewUrl,      // URL para mostrar
            backgroundFile: resizedBlob  // Blob real para subir
          };
          return updated;
        });

      } catch (error) {
        console.error("Error al procesar la imagen de fondo:", error);
        toast.error("Error al procesar la imagen de fondo");
      }
    },
    [currentPage, setPages]
  );

  // Función para quitar fondo
  const removeBackground = useCallback(() => {
    setPages(prev => {
      const updated = [...prev];
      const currentPageData = updated[currentPage];

      // Liberar memoria del blob URL si existe
      if (currentPageData.background &&
        typeof currentPageData.background === 'string' &&
        currentPageData.background.startsWith('blob:')) {
        URL.revokeObjectURL(currentPageData.background);
      }

      // Limpiar tanto la URL como el archivo
      updated[currentPage] = {
        ...currentPageData,
        background: null,
        backgroundFile: null
      };

      return updated;
    });
  }, [currentPage, setPages]);


return {
  handleImageChange,
  removeImage,
  handleBackgroundFile,
  removeBackground,
  resizeImage,
  fetchFileFromUrl,
  getFileExtension
};
};
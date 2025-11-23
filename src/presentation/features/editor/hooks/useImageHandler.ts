/**
 * UBICACIÓN: src/presentation/features/books/hooks/useImageHandler.ts
 * 
 * ACTUALIZADO:
 * - Permitir imagen de contenido + imagen de fondo simultáneamente
 * - No mezclar ambos tipos de imágenes
 */

import { useCallback } from 'react';
import toast from 'react-hot-toast';
import type { page } from '@/src/typings/types-page-book/index';

interface UseImageHandlerProps {
  pages: page[];
  currentPage: number;
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
  onBackgroundChange?: () => void;
}

export interface UseImageHandlerReturn {
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeImage: () => void;
  handleBackgroundFile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeBackground: () => void;
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

export const useImageHandler = ({
  pages,
  currentPage,
  setPages,
  onBackgroundChange
}: UseImageHandlerProps): UseImageHandlerReturn => {

  /**
   * ✅ Handler para IMAGEN DE CONTENIDO (va en el layout)
   */
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

          // Liberar URL anterior si existe
          if (currentPageData.image && currentPageData.image.startsWith('blob:')) {
            URL.revokeObjectURL(currentPageData.image);
          }

          // ✅ Actualizar SOLO la imagen de contenido
          updated[currentPage] = {
            ...currentPageData,
            image: previewUrl,
            file: resizedBlob
          };
          return updated;
        });

        toast.success('✅ Imagen cargada correctamente');
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
        toast.error("❌ Error al procesar la imagen");
      }
    },
    [currentPage, setPages]
  );

  /**
   * ✅ Remover IMAGEN DE CONTENIDO
   */
  const removeImage = useCallback(() => {
    setPages(prev => {
      const updated = [...prev];
      const currentPageData = updated[currentPage];

      // Liberar memoria del blob URL si existe
      if (currentPageData.image && currentPageData.image.startsWith('blob:')) {
        URL.revokeObjectURL(currentPageData.image);
      }

      // ✅ Limpiar SOLO imagen de contenido
      updated[currentPage] = {
        ...currentPageData,
        image: null,
        file: null
      };

      return updated;
    });

    toast.success('🗑️ Imagen eliminada');
  }, [currentPage, setPages]);

  /**
   * ✅ Handler para IMAGEN DE FONDO (background)
   */
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

          // Liberar URL anterior si existe Y es blob
          const currentBg = currentPageData.background;
          if (currentBg && typeof currentBg === 'string' && currentBg.startsWith('blob:')) {
            URL.revokeObjectURL(currentBg);
          }

          // ✅ Actualizar SOLO el fondo
          updated[currentPage] = {
            ...currentPageData,
            background: previewUrl,
            backgroundFile: resizedBlob
          };
          return updated;
        });

        // Notificar cambio de fondo
        if (onBackgroundChange) {
          onBackgroundChange();
        }

        toast.success('✅ Fondo cargado correctamente');
      } catch (error) {
        console.error("Error al procesar la imagen de fondo:", error);
        toast.error("❌ Error al procesar la imagen de fondo");
      }
    },
    [currentPage, setPages, onBackgroundChange]
  );

  /**
   * ✅ Quitar IMAGEN DE FONDO (background)
   */
  const removeBackground = useCallback(() => {
    setPages(prev => {
      const updated = [...prev];
      const currentPageData = updated[currentPage];

      // Liberar memoria del blob URL si existe
      const currentBg = currentPageData.background;
      if (currentBg && typeof currentBg === 'string' && currentBg.startsWith('blob:')) {
        URL.revokeObjectURL(currentBg);
      }

      // ✅ Limpiar SOLO el fondo
      updated[currentPage] = {
        ...currentPageData,
        background: 'blanco', // Resetear a blanco
        backgroundFile: null
      };

      return updated;
    });

    // Notificar cambio de fondo
    if (onBackgroundChange) {
      onBackgroundChange();
    }

    toast.success('🗑️ Fondo eliminado');
  }, [currentPage, setPages, onBackgroundChange]);

  return {
    handleImageChange,
    removeImage,
    handleBackgroundFile,
    removeBackground
  };
};
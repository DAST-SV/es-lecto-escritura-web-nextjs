import toast from "react-hot-toast";
import { getUserId } from "@/src/utils/supabase/utilsClient";
import {
  uploadFile,
  generateFilePath,
  removeFolder,
} from "@/src/utils/supabase/storageService";
import type {
  Page,
  page,
  LayoutType,
  backgroundstype,
} from "@/src/typings/types-page-book/index";
import { backgrounds } from "@/src/typings/types-page-book/backgrounds";
import {
  getFileExtension,
  fetchFileFromUrl,
} from "@/src/components/components-for-books/book/create-edits-books/utils/imageUtils";

/**
 * Metadata requerida para crear/actualizar un libro
 */
export interface BookMetadata {
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedValores: (number | string)[];
  selectedNivel: number | null;
  autor: string;
  descripcion: string;
  titulo: string;
  portada: File | null;         // 👈 Nuevo archivo a subir
  portadaUrl?: string | null;   // 👈 URL existente de la BD
}

/**
 * Convierte una página del editor a formato de persistencia
 */
export function convertPage(oldPage: page): Page {
  return {
    layout: oldPage.layout as LayoutType,
    title: oldPage.title,
    text: oldPage.text,
    image: oldPage.image ?? undefined,
    background: oldPage.background as backgroundstype,
    animation: undefined,
    audio: undefined,
    interactiveGame: undefined,
    items: [],
    border: undefined,
  };
}

/**
 * Valida que los metadatos del libro sean correctos
 */
function validateBookMetadata(metadata: BookMetadata): string | null {
  // Categorías: debe ser un array de números y no vacío
  if (!Array.isArray(metadata.selectedCategorias) || metadata.selectedCategorias.length === 0) {
    return "Por favor selecciona al menos un Tipo de Lectura";
  }

  // Géneros: debe ser un array de números y no vacío
  if (!Array.isArray(metadata.selectedGeneros) || metadata.selectedGeneros.length === 0) {
    return "Por favor selecciona al menos un Genero";
  }

  // Etiquetas: si se envían, debe ser un array de números (opcional)
  if (metadata.selectedEtiquetas && !Array.isArray(metadata.selectedEtiquetas)) {
    return "Etiquetas inválidas";
  }

  if (metadata.selectedValores && !Array.isArray(metadata.selectedValores)) {
    return "valores inválidas";
  }

  // Portada obligatoria (puede ser File nuevo o URL existente)
  if (!metadata.portada && !metadata.portadaUrl) {
    return "Por favor selecciona una portada";
  }

  // Autor obligatorio
  if (!metadata.autor || metadata.autor.trim() === "") {
    return "Por favor ingresa un autor";
  }

  // Descripción obligatoria
  if (!metadata.descripcion || metadata.descripcion.trim() === "") {
    return "Por favor ingresa una descripción";
  }

  // Título obligatorio
  if (!metadata.titulo || metadata.titulo.trim() === "") {
    return "Por favor ingresa un título";
  }

  return null; // Todo válido
}

/**
 * Crea un nuevo libro en la base de datos
 */
async function createNewBook(
  userId: string,
  metadata: BookMetadata,
  portadaUrl: string | null
): Promise<string> {
  const response = await fetch("/api/libros/createbook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      title: metadata.titulo,
      portada: portadaUrl, // 👈 Usar la URL procesada
      categoria: metadata.selectedCategorias,
      genero: metadata.selectedGeneros,
      etiquetas: metadata.selectedEtiquetas,
      valores: metadata.selectedValores,
      autor: metadata.autor,
      nivel: metadata.selectedNivel,
      descripcion: metadata.descripcion.trim(),
    }),
  });

  const data = await response.json();
  if (!data.libroId) {
    throw new Error(data.error || "Error creando libro");
  }

  return data.libroId;
}

/**
 * Obtiene blobs desde URLs existentes antes de eliminar archivos
 */
async function fetchExistingBlobs(pages: page[]): Promise<void> {
  const httpUrlRegex = /^https?:\/\/.+/i;

  await Promise.all(
    pages.map(async (p: page, idx: number) => {
      // Obtener blob de imagen si solo hay URL
      if (
        !p.file &&
        p.image &&
        typeof p.image === "string" &&
        httpUrlRegex.test(p.image)
      ) {
        p.file = await fetchFileFromUrl(p.image);
      }

      // Obtener blob de fondo si solo hay URL
      if (
        !p.backgroundFile &&
        p.background &&
        typeof p.background === "string" &&
        httpUrlRegex.test(p.background) &&
        !backgrounds[p.background as backgroundstype]
      ) {
        p.backgroundFile = await fetchFileFromUrl(p.background);
      }
    })
  );
}

/**
 * Sube archivos de las páginas al storage y actualiza las páginas
 */
async function uploadPagesFiles(
  pages: page[],
  userId: string,
  libroId: string
): Promise<{ convertedPages: Page[]; uploadedImages: string[] }> {
  const uploadedImages: string[] = [];

  const convertedPages: Page[] = await Promise.all(
    pages.map(async (p: page, idx: number) => {
      const pageCopy = convertPage(p);

      // Manejar imagen principal
      if (p.file) {
        const ext = getFileExtension(p.file);
        const filePath = generateFilePath(
          userId,
          libroId,
          `pagina_${idx + 1}_file.${ext}`
        );
        pageCopy.image = await uploadFile(p.file, "ImgLibros", filePath);
        uploadedImages.push(filePath);
      }

      // Manejar imagen de fondo
      if (p.backgroundFile) {
        const ext = getFileExtension(p.backgroundFile);
        const bgPath = generateFilePath(
          userId,
          libroId,
          `pagina_${idx + 1}_bg.${ext}`
        );
        pageCopy.background = await uploadFile(
          p.backgroundFile,
          "ImgLibros",
          bgPath
        );
        uploadedImages.push(bgPath);
      }

      return pageCopy;
    })
  );

  return { convertedPages, uploadedImages };
}

/**
 * Sube la portada al storage y retorna la URL
 */
async function uploadPortada(
  portadaFile: File,
  userId: string,
  libroId: string
): Promise<string> {
  const ext = getFileExtension(portadaFile);
  const filePath = generateFilePath(userId, libroId, `portada.${ext}`);
  const uploadedUrl = await uploadFile(portadaFile, "ImgLibros", filePath);
  return uploadedUrl;
}

/**
 * Procesa la portada: sube si es File, mantiene si es URL
 */
async function processPortada(
  metadata: BookMetadata,
  userId: string,
  libroId: string
): Promise<string | null> {
  // Si hay un nuevo archivo, subirlo
  if (metadata.portada instanceof File) {
    return await uploadPortada(metadata.portada, userId, libroId);
  }
  
  // Si no hay archivo nuevo, usar la URL existente
  if (metadata.portadaUrl) {
    return metadata.portadaUrl;
  }
  
  // No hay portada
  return null;
}

/**
 * Actualiza un libro existente
 */
async function updateExistingBook(
  libroId: string,
  convertedPages: Page[],
  metadata: BookMetadata,
  portadaUrl: string | null
): Promise<void> {
  const response = await fetch("/api/libros/updatebook/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idLibro: libroId,
      pages: convertedPages,
      categoria: metadata.selectedCategorias,
      genero: metadata.selectedGeneros,
      etiquetas: metadata.selectedEtiquetas,
      valores: metadata.selectedValores,
      autor: metadata.autor,
      descripcion: metadata.descripcion.trim(),
      titulo: metadata.titulo.trim(),
      nivel: metadata.selectedNivel,
      portada: portadaUrl, // 👈 Usar la URL procesada
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error actualizando libro");
  }
}

/**
 * Actualiza las páginas de un libro nuevo
 */
async function updateNewBookPages(
  libroId: string,
  convertedPages: Page[],
  portadaUrl: string | null
): Promise<void> {
  const response = await fetch("/api/libros/updatebook/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idLibro: libroId,
      pages: convertedPages,
      portada: portadaUrl, // 👈 Usar la URL procesada
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error guardando páginas");
  }
}

/**
 * Hace rollback eliminando un libro creado por error
 */
async function rollbackNewBook(
  libroId: string,
  uploadedImages: string[]
): Promise<void> {
  try {
    await fetch(`/api/libros/deletebook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ LibroId: libroId, imagenes: uploadedImages }),
    });
  } catch (rollbackErr) {
    console.error("Error haciendo rollback:", rollbackErr);
  }
}

/**
 * Función principal para guardar un libro (crear o actualizar)
 */
export async function saveBookJson(
  pages: page[],
  metadata: BookMetadata,
  IdLibro?: string
): Promise<void> {
  let libroId: string | null = IdLibro ?? null;
  const uploadedImages: string[] = [];

  try {
    // Validar usuario autenticado
    const userId = await getUserId();
    if (!userId) {
      throw new Error("Usuario no autenticado");
    }

    // Validar que hay páginas
    if (!pages || pages.length === 0) {
      throw new Error("No hay páginas para guardar");
    }

    // Validar metadatos
    const validationError = validateBookMetadata(metadata);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Obtener blobs desde URLs existentes (solo para libros existentes)
    if (IdLibro) {
      await fetchExistingBlobs(pages);
    }

    // Eliminar archivos anteriores si es un libro existente
    if (IdLibro) {
      const removeResult = await removeFolder(
        "ImgLibros",
        `${userId}/${libroId}`
      );
      console.log("Archivos eliminados:", removeResult.removed);
    }

    // 🔥 PROCESAR PORTADA: subir si es File, mantener si es URL
    const portadaUrl = libroId 
      ? await processPortada(metadata, userId, libroId)
      : null;

    // Si no hay ID de libro, crear uno nuevo
    if (!libroId) {
      libroId = await createNewBook(userId, metadata, portadaUrl);
    }

    // Subir archivos de páginas
    const { convertedPages, uploadedImages: newUploadedImages } =
      await uploadPagesFiles(pages, userId, libroId!);
    uploadedImages.push(...newUploadedImages);

    // Guardar o actualizar el libro
    if (IdLibro) {
      // Actualizar libro existente
      await updateExistingBook(libroId!, convertedPages, metadata, portadaUrl);
      toast.success("📚 Libro actualizado correctamente");
    } else {
      // Finalizar creación de libro nuevo
      await updateNewBookPages(libroId!, convertedPages, portadaUrl);
      toast.success("📚 Libro guardado correctamente");
    }
  } catch (error: any) {
    console.error("❌ Error guardando libro:", error.message);
    toast.error("❌ Error al guardar el libro");

    // Rollback si se creó un libro nuevo
    if (!IdLibro && libroId) {
      await rollbackNewBook(libroId, uploadedImages);
    }

    throw error; // Re-lanzar para manejo superior si es necesario
  }
}
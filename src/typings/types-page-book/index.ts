/**
 * UBICACIÓN: src/typings/types-page-book/index.ts
 * 
 * Tipos para las páginas del libro
 * ✅ ACTUALIZADO: Incluye file y backgroundFile para upload
 */

// Tipos de layout disponibles
export type LayoutType = 
  | 'CoverLayout'
  | 'TextCenterLayout'
  | 'ImageLeftTextRightLayout'
  | 'TextLeftImageRightLayout'
  | 'SplitTopBottomLayout'
  | 'ImageFullLayout'
  | 'SplitLayout'
  | 'CenterImageDownTextLayout'
  | 'InteractiveLayout';

// Tipos de fondo disponibles
export type backgroundstype = 
  | 'blanco'
  | 'crema'
  | 'gris'
  | 'azul'
  | 'verde'
  | 'rosa'
  | 'amarillo'
  | 'naranja'
  | 'morado'
  | 'rojo'
  | string; // Para colores hex y URLs de imágenes

// Tipos de borde
export type BorderType = 'cuadrado' | 'redondeado' | 'circular';

// Tipos de animación
export type AnimationType = 
  | 'fadeIn'
  | 'slideIn'
  | 'zoomIn'
  | 'bounceIn'
  | undefined;

/**
 * Tipo para página en el editor (con archivos temporales)
 */
export interface page {
  id?: string;
  layout: string;
  title: string;
  text: string;
  image: string | null;
  background: string | null;
  
  // ✅ NUEVOS: Archivos para upload
  file?: Blob | null;           // Imagen de contenido (archivo)
  backgroundFile?: Blob | null;  // Fondo de página (archivo)
  
  // Opcionales
  animation?: AnimationType;
  audio?: string;
  interactiveGame?: string;
  items?: string[];
  border?: BorderType;
}

/**
 * Tipo para página en el dominio/base de datos
 */
export interface Page {
  layout: LayoutType;
  title: string;
  text: string;
  image?: string;
  background?: backgroundstype;
  animation?: AnimationType;
  audio?: string;
  interactiveGame?: string;
  items?: string[];
  border?: BorderType;
}

/**
 * Datos de página para guardar en BD
 */
export interface PageData {
  layout: string;
  title?: string;
  text?: string;
  image?: string;
  background?: string;
}

/**
 * Helper para convertir page (editor) a Page (dominio)
 */
export function convertEditorPageToPage(editorPage: page): Page {
  return {
    layout: editorPage.layout as LayoutType,
    title: editorPage.title,
    text: editorPage.text,
    image: editorPage.image || undefined,
    background: editorPage.background as backgroundstype || undefined,
    animation: editorPage.animation,
    audio: editorPage.audio,
    interactiveGame: editorPage.interactiveGame,
    items: editorPage.items,
    border: editorPage.border,
  };
}

/**
 * Helper para crear una página vacía
 */
export function createEmptyPage(id: string, layout: LayoutType = 'TextCenterLayout'): page {
  return {
    id,
    layout,
    title: '',
    text: '',
    image: null,
    background: 'blanco',
    file: null,
    backgroundFile: null,
  };
}
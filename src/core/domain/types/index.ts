/**
 * UBICACIÓN: src/core/domain/types/index.ts
 * 
 * Tipos consolidados del dominio de libros
 * ✅ Reemplaza: typings/types-page-book/index.ts
 */

// ============================================
// LAYOUTS
// ============================================
export type LayoutType = 
  | 'CoverLayout'
  | 'TextCenterLayout'
  | 'ImageLeftTextRightLayout'
  | 'TextLeftImageRightLayout'
  | 'SplitTopBottomLayout'
  | 'ImageFullLayout'
  | 'SplitLayout'
  | 'CenterImageDownTextLayout';

export const LAYOUT_TYPES: readonly LayoutType[] = [
  'CoverLayout',
  'TextCenterLayout',
  'ImageLeftTextRightLayout',
  'TextLeftImageRightLayout',
  'SplitTopBottomLayout',
  'ImageFullLayout',
  'SplitLayout',
  'CenterImageDownTextLayout',
] as const;

/**
 * Verificar si un string es un layout válido
 */
export function isValidLayout(value: string): value is LayoutType {
  return LAYOUT_TYPES.includes(value as LayoutType);
}

/**
 * Layouts que requieren imagen
 */
export const LAYOUTS_WITH_IMAGE: readonly LayoutType[] = [
  'CoverLayout',
  'ImageLeftTextRightLayout',
  'TextLeftImageRightLayout',
  'SplitTopBottomLayout',
  'ImageFullLayout',
  'SplitLayout',
  'CenterImageDownTextLayout',
] as const;

/**
 * Layouts que son solo texto
 */
export const TEXT_ONLY_LAYOUTS: readonly LayoutType[] = [
  'TextCenterLayout',
] as const;

// ============================================
// BACKGROUNDS
// ============================================
export const BACKGROUND_PRESETS = {
  blanco: '#ffffff',
  crema: '#fef3c7',
  gris: '#f3f4f6',
  azul: '#dbeafe',
  verde: '#d1fae5',
  rosa: '#fce7f3',
  amarillo: '#fef9c3',
  naranja: '#fed7aa',
  morado: '#e9d5ff',
  rojo: '#fecaca',
  negro: '#1f2937',
  azulOscuro: '#1e3a5f',
  verdeOscuro: '#064e3b',
} as const;

export type BackgroundPresetKey = keyof typeof BACKGROUND_PRESETS;

/**
 * Tipo de fondo: preset, color hex, o URL de imagen
 */
export type BackgroundType = BackgroundPresetKey | string;

/**
 * Verificar si es un preset válido
 */
export function isBackgroundPreset(value: string): value is BackgroundPresetKey {
  return value in BACKGROUND_PRESETS;
}

/**
 * Verificar si es un color hex válido
 */
export function isHexColor(value: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(value);
}

/**
 * Verificar si es una URL de imagen
 */
export function isImageUrl(value: string): boolean {
  return value.startsWith('http://') || 
         value.startsWith('https://') || 
         value.startsWith('blob:');
}

/**
 * Obtener el color de un fondo
 */
export function getBackgroundColor(value: string): string {
  if (isBackgroundPreset(value)) {
    return BACKGROUND_PRESETS[value];
  }
  if (isHexColor(value)) {
    return value;
  }
  return BACKGROUND_PRESETS.blanco;
}

// ============================================
// BORDERS
// ============================================
export const BORDER_STYLES = {
  cuadrado: '0',
  redondeado: '8px',
  circular: '16px',
} as const;

export type BorderType = keyof typeof BORDER_STYLES;

/**
 * Obtener border-radius de un estilo
 */
export function getBorderRadius(value: string): string {
  if (value in BORDER_STYLES) {
    return BORDER_STYLES[value as BorderType];
  }
  return BORDER_STYLES.cuadrado;
}

// ============================================
// FONT FAMILIES
// ============================================
export const FONT_FAMILIES = {
  'Arial': 'Arial, sans-serif',
  'Comic Sans': '"Comic Sans MS", cursive',
  'Georgia': 'Georgia, serif',
  'Times New Roman': '"Times New Roman", serif',
  'Verdana': 'Verdana, sans-serif',
  'Courier New': '"Courier New", monospace',
  'Impact': 'Impact, fantasy',
  'Brush Script': '"Brush Script MT", cursive',
} as const;

export type FontFamilyKey = keyof typeof FONT_FAMILIES;

// ============================================
// FONT SIZES
// ============================================
export const FONT_SIZES = {
  'extra-small': '0.625rem',
  'small': '0.75rem',
  'normal': '0.875rem',
  'medium': '1rem',
  'large': '1.125rem',
  'extra-large': '1.25rem',
  'huge': '1.5rem',
  'massive': '2rem',
} as const;

export type FontSizeKey = keyof typeof FONT_SIZES;

// ============================================
// LINE HEIGHTS
// ============================================
export const LINE_HEIGHTS = {
  'compact': '1',
  'tight': '1.15',
  'normal': '1.5',
  'relaxed': '1.8',
  'loose': '2',
  'extra-loose': '2.5',
} as const;

export type LineHeightKey = keyof typeof LINE_HEIGHTS;

// ============================================
// TEXT COLORS
// ============================================
export const TEXT_COLORS = {
  // Básicos
  negro: '#000000',
  blanco: '#ffffff',
  gris: '#808080',
  grisClaro: '#d3d3d3',
  grisOscuro: '#404040',
  
  // Primarios
  rojo: '#dc2626',
  verde: '#16a34a',
  azul: '#2563eb',
  
  // Secundarios
  amarillo: '#eab308',
  naranja: '#ea580c',
  morado: '#7c3aed',
  rosa: '#ec4899',
  cian: '#0891b2',
  
  // Especiales
  azulEnlace: '#2563eb',
  verdeExito: '#059669',
  rojoError: '#dc2626',
  amarilloAdvertencia: '#d97706',
} as const;

export type TextColorKey = keyof typeof TEXT_COLORS;

// ============================================
// PAGE DATA (para editor)
// ============================================

/**
 * Datos de página en el editor (con archivos temporales)
 */
export interface PageEditorData {
  id: string;
  layout: LayoutType;
  title: string;
  text: string;
  image: string | null;
  background: string | null;
  
  // Archivos para upload
  imageFile?: Blob | null;
  backgroundFile?: Blob | null;
}

/**
 * Datos de página para base de datos
 */
export interface PageDatabaseData {
  layout: string;
  title: string;
  text: string;
  image?: string | null;
  background?: string | null;
}

// ============================================
// HELPERS
// ============================================

/**
 * Verificar si un layout requiere imagen
 */
export function layoutRequiresImage(layout: LayoutType): boolean {
  return LAYOUTS_WITH_IMAGE.includes(layout);
}

/**
 * Verificar si un layout es solo texto
 */
export function isTextOnlyLayout(layout: LayoutType): boolean {
  return TEXT_ONLY_LAYOUTS.includes(layout);
}

/**
 * Crear página vacía para editor
 */
export function createEmptyEditorPage(id: string, layout: LayoutType = 'TextCenterLayout'): PageEditorData {
  return {
    id,
    layout,
    title: '',
    text: '',
    image: null,
    background: 'blanco',
    imageFile: null,
    backgroundFile: null,
  };
}

/**
 * Validar datos de página
 */
export function validatePageData(page: PageEditorData): string[] {
  const errors: string[] = [];

  // Validar layout requiere imagen
  if (layoutRequiresImage(page.layout)) {
    const hasImage = page.image || page.imageFile;
    if (!hasImage && page.layout !== 'CoverLayout') {
      errors.push('Este layout requiere una imagen');
    }
  }

  // Validar contenido de portada
  if (page.layout === 'CoverLayout') {
    if (!page.title || page.title.trim() === '') {
      errors.push('La portada debe tener un título');
    }
  }

  // Validar texto en layouts de texto
  if (isTextOnlyLayout(page.layout)) {
    if (!page.title && !page.text) {
      errors.push('La página debe tener al menos título o texto');
    }
  }

  return errors;
}
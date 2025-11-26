/**
 * ============================================
 * ARCHIVO 1: src/core/domain/types/index.ts
 * REEMPLAZAR TODO EL CONTENIDO
 * ============================================
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

export const LAYOUTS_WITH_IMAGE: readonly LayoutType[] = [
  'CoverLayout',
  'ImageLeftTextRightLayout',
  'TextLeftImageRightLayout',
  'SplitTopBottomLayout',
  'ImageFullLayout',
  'SplitLayout',
  'CenterImageDownTextLayout',
] as const;

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
export type BackgroundType = BackgroundPresetKey | string;

// Alias para compatibilidad
export const backgrounds = BACKGROUND_PRESETS;

// ============================================
// BORDERS
// ============================================
export const BORDER_STYLES = {
  cuadrado: '0',
  redondeado: '8px',
  circular: '16px',
} as const;

export type BorderType = keyof typeof BORDER_STYLES;

// Alias para compatibilidad
export const borders = BORDER_STYLES;

// ============================================
// TIPOS DE PÁGINA
// ============================================

/**
 * Página en el editor (con archivos temporales)
 * Usa esto en BookEditor, useBookState, etc.
 */
export interface page {
  id: string;
  layout: string;
  title: string;
  text: string;
  image: string | null;
  background: string | null;
  file?: Blob | null;
  backgroundFile?: Blob | null;
  animation?: string;
  audio?: string;
  interactiveGame?: string;
  items?: string[];
  border?: string;
}

/**
 * Página para renderizar (sin archivos temporales)
 * Usa esto en PageRenderer, layouts individuales
 */
export interface Page {
  layout: LayoutType;
  title: string;
  text: string;
  image?: string;
  background?: BackgroundType;
  animation?: string;
  audio?: string;
  interactiveGame?: string;
  items?: string[];
  border?: string;
}

/**
 * Alias para mantener compatibilidad
 */
export type PageEditorData = page;
export type PageEditor = page;

// ============================================
// CONVERSORES
// ============================================

/**
 * Convierte page (editor) → Page (render)
 */
export function pageToRenderPage(p: page): Page {
  return {
    layout: p.layout as LayoutType,
    title: p.title,
    text: p.text,
    image: p.image || undefined,
    background: p.background || undefined,
    animation: p.animation,
    audio: p.audio,
    interactiveGame: p.interactiveGame,
    items: p.items,
    border: p.border,
  };
}

// ============================================
// HELPERS
// ============================================

export function isValidLayout(value: string): value is LayoutType {
  return LAYOUT_TYPES.includes(value as LayoutType);
}

export function isBackgroundPreset(value: string): value is BackgroundPresetKey {
  return value in BACKGROUND_PRESETS;
}

export function isHexColor(value: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(value);
}

export function isImageUrl(value: string): boolean {
  return value.startsWith('http://') || 
         value.startsWith('https://') || 
         value.startsWith('blob:');
}

export function getBackgroundColor(value: string): string {
  if (isBackgroundPreset(value)) {
    return BACKGROUND_PRESETS[value];
  }
  if (isHexColor(value)) {
    return value;
  }
  return BACKGROUND_PRESETS.blanco;
}

export function getBorderRadius(value: string): string {
  if (value in BORDER_STYLES) {
    return BORDER_STYLES[value as BorderType];
  }
  return BORDER_STYLES.cuadrado;
}

export function layoutRequiresImage(layout: LayoutType): boolean {
  return LAYOUTS_WITH_IMAGE.includes(layout);
}

export function isTextOnlyLayout(layout: LayoutType): boolean {
  return TEXT_ONLY_LAYOUTS.includes(layout);
}

export function createEmptyEditorPage(id: string, layout: LayoutType = 'TextCenterLayout'): page {
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

export function validatePageData(page: page): string[] {
  const errors: string[] = [];

  if (isValidLayout(page.layout) && layoutRequiresImage(page.layout as LayoutType)) {
    const hasImage = page.image || page.file;
    if (!hasImage && page.layout !== 'CoverLayout') {
      errors.push('Este layout requiere una imagen');
    }
  }

  if (page.layout === 'CoverLayout') {
    if (!page.title || page.title.trim() === '') {
      errors.push('La portada debe tener un título');
    }
  }

  if (page.layout === 'TextCenterLayout') {
    if (!page.title && !page.text) {
      errors.push('La página debe tener al menos título o texto');
    }
  }

  return errors;
}

// ============================================
// FONTS (para compatibilidad)
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

export const LINE_HEIGHTS = {
  'compact': '1',
  'tight': '1.15',
  'normal': '1.5',
  'relaxed': '1.8',
  'loose': '2',
  'extra-loose': '2.5',
} as const;

export type LineHeightKey = keyof typeof LINE_HEIGHTS;

export const TEXT_COLORS = {
  negro: '#000000',
  blanco: '#ffffff',
  gris: '#808080',
  grisClaro: '#d3d3d3',
  grisOscuro: '#404040',
  rojo: '#dc2626',
  verde: '#16a34a',
  azul: '#2563eb',
  amarillo: '#eab308',
  naranja: '#ea580c',
  morado: '#7c3aed',
  rosa: '#ec4899',
  cian: '#0891b2',
  azulEnlace: '#2563eb',
  verdeExito: '#059669',
  rojoError: '#dc2626',
  amarilloAdvertencia: '#d97706',
} as const;

export type TextColorKey = keyof typeof TEXT_COLORS;

// ============================================
// TIPOS DE BASE DE DATOS
// ============================================

/**
 * DTO para páginas (lo que se envía al backend)
 */
export interface PageDatabaseData {
  layout: string;
  title: string;
  text: string;
  image?: string | null;
  background?: string | null;
}
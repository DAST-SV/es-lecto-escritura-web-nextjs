/**
 * ============================================
 * TIPOS DE DOMINIO
 * Clean Architecture - Domain Layer Types
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
export type BackgroundType = BackgroundPresetKey | string; // hex color o URL

// ============================================
// PÁGINA - TIPO ÚNICO
// ============================================

/**
 * UN SOLO tipo de página
 * Usado TANTO en editor como en visualización
 * Los archivos temporales (Blob) son opcionales
 */
export interface Page {
  id: string;
  layout: LayoutType;
  title: string;
  text: string;
  image: string | null;
  background: BackgroundType | null;
  
  // Archivos temporales (solo en editor)
  file?: Blob | null;
  backgroundFile?: Blob | null;
  
  // Opcionales (futuro)
  animation?: string;
  audio?: string;
  interactiveGame?: string;
  items?: string[];
  border?: string;
}

// ============================================
// METADATA DE LIBRO
// ============================================

export interface BookMetadata {
  titulo: string;
  autores: string[];
  personajes: string[];
  descripcion: string;
  portada: File | string | null;
  portadaUrl?: string | null;
  cardBackgroundImage?: File | null;
  cardBackgroundUrl?: string | null;
  selectedCategorias: number[];
  selectedGeneros: number[];
  selectedEtiquetas: number[];
  selectedValores: number[];
  selectedNivel: number | null;
}

// ============================================
// ERROR DE DOMINIO
// ============================================

export class EntityValidationError extends Error {
  constructor(public entityName: string, public validationErrors: string[]) {
    super(`Validación fallida en ${entityName}: ${validationErrors.join(', ')}`);
    this.name = 'EntityValidationError';
  }
}

// ============================================
// HELPERS
// ============================================

export function isValidLayout(value: string): value is LayoutType {
  const layouts: LayoutType[] = [
    'CoverLayout',
    'TextCenterLayout',
    'ImageLeftTextRightLayout',
    'TextLeftImageRightLayout',
    'SplitTopBottomLayout',
    'ImageFullLayout',
    'SplitLayout',
    'CenterImageDownTextLayout'
  ];
  return layouts.includes(value as LayoutType);
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

export function createEmptyPage(id: string, layout: LayoutType = 'TextCenterLayout'): Page {
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

/**
 * Limpiar página para enviar al backend
 * Elimina archivos temporales y URLs blob:
 */
export function sanitizePageForBackend(page: Page) {
  return {
    layout: page.layout,
    title: page.title || '',
    text: page.text || '',
    image: page.image && !page.image.startsWith('blob:') ? page.image : '',
    background: page.background && !page.background.startsWith('blob:') ? page.background : 'blanco',
  };
}


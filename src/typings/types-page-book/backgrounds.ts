/**
 * UBICACIÓN: src/typings/types-page-book/backgrounds.ts
 * 
 * Colores de fondo predefinidos para las páginas
 */

export const backgrounds = {
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

export type BackgroundKey = keyof typeof backgrounds;

/**
 * Verifica si un valor es un color de fondo predefinido
 */
export function isPresetBackground(value: string): value is BackgroundKey {
  return value in backgrounds;
}

/**
 * Obtiene el color hex de un fondo
 */
export function getBackgroundColor(value: string): string {
  if (isPresetBackground(value)) {
    return backgrounds[value];
  }
  
  // Si es un color hex, devolverlo tal cual
  if (value.startsWith('#')) {
    return value;
  }
  
  // Default blanco
  return backgrounds.blanco;
}
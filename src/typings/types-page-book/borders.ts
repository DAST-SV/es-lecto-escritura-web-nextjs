/**
 * UBICACIÓN: src/typings/types-page-book/borders.ts
 * 
 * Estilos de borde para las páginas
 */

export const borders = {
  cuadrado: '0',
  redondeado: '8px',
  circular: '16px',
} as const;

export type BorderKey = keyof typeof borders;

/**
 * Obtiene el border-radius de un estilo de borde
 */
export function getBorderRadius(value: string): string {
  if (value in borders) {
    return borders[value as BorderKey];
  }
  return borders.cuadrado;
}
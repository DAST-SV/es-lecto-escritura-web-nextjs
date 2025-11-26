/**
 * Registro central de todos los layouts disponibles
 * Vincula los IDs de layout con sus componentes React
 */

import { CoverLayout } from './components/CoverLayout';
import { TextCenterLayout } from './components/TextCenterLayout';
import { ImageLeftTextRightLayout } from './components/ImageLeftTextRightLayout';
import { TextLeftImageRightLayout } from './components/TextLeftImageRightLayout';
import { SplitTopBottomLayout } from './components/SplitTopBottomLayout';
import { ImageFullLayout } from './components/ImageFullLayout';
import { SplitLayout } from './components/SplitLayout';
import { CenterImageDownTextLayout } from './components/CenterImageDownTextLayout';
import { InteractiveLayout } from './components/InteractiveLayout';
import type { page } from '@/src/core/domain/types';

/**
 * Tipo de componente Layout
 * Todos los layouts deben seguir esta firma
 */
export type LayoutComponent = React.FC<{ page: Page }>;

/**
 * Registro de layouts disponibles
 * Cada key debe coincidir con los IDs en layoutDefinitions.ts
 */
export const layoutRegistry: Record<string, LayoutComponent> = {
  CoverLayout,
  TextCenterLayout,
  ImageLeftTextRightLayout,
  TextLeftImageRightLayout,
  SplitTopBottomLayout,
  ImageFullLayout,
  SplitLayout,
  CenterImageDownTextLayout,
  InteractiveLayout,
} as const;

/**
 * Tipo derivado de las keys del registro
 */
export type LayoutType = keyof typeof layoutRegistry;

/**
 * Helper para obtener un layout por ID
 * Retorna TextCenterLayout por defecto si el ID no existe
 */
export function getLayout(layoutId: string): LayoutComponent {
  return layoutRegistry[layoutId] || layoutRegistry.TextCenterLayout;
}

/**
 * Helper para validar si un layout ID es válido
 */
export function isValidLayoutId(layoutId: string): layoutId is LayoutType {
  return layoutId in layoutRegistry;
}

/**
 * Lista de IDs de layouts disponibles
 */
export const availableLayoutIds = Object.keys(layoutRegistry) as LayoutType[];

/**
 * Configuración de layouts especiales
 */
export const layoutConfig = {
  // Layouts que solo se pueden usar en la primera página
  firstPageOnly: ['CoverLayout'] as const,
  
  // Layouts que requieren imagen obligatoria
  requiresImage: ['ImageFullLayout'] as const,
  
  // Layouts que requieren texto obligatorio
  requiresText: ['TextCenterLayout'] as const,
  
  // Layout por defecto
  default: 'TextCenterLayout' as const,
};

/**
 * Helper para verificar si un layout se puede usar en una página específica
 */
export function canUseLayoutOnPage(layoutId: string, pageNumber: number): boolean {
  // Si es la primera página, todos los layouts están permitidos
  if (pageNumber === 1) return true;
  
  // Si NO es la primera página, no permitir layouts especiales
  return !layoutConfig.firstPageOnly.includes(layoutId as any);
}
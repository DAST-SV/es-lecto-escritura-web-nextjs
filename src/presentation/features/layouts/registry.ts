/**
 * UBICACIÓN: src/presentation/features/layouts/registry.ts
 * ✅ LIMPIO: Usa tipo Page único
 */

import { Page, LayoutType } from '@/src/core/domain/types';

// Importar layouts
import { CoverLayout } from './components/CoverLayout';
import { TextCenterLayout } from './components/TextCenterLayout';
import { ImageLeftTextRightLayout } from './components/ImageLeftTextRightLayout';
import { TextLeftImageRightLayout } from './components/TextLeftImageRightLayout';
import { SplitTopBottomLayout } from './components/SplitTopBottomLayout';
import { ImageFullLayout } from './components/ImageFullLayout';
import { SplitLayout } from './components/SplitLayout';
import { CenterImageDownTextLayout } from './components/CenterImageDownTextLayout';
import { InteractiveLayout } from './components/InteractiveLayout';

/**
 * Tipo de componente Layout
 */
export type LayoutComponent = React.FC<{ page: Page }>;

/**
 * Registro de layouts
 */
export const layoutRegistry: Record<LayoutType, LayoutComponent> = {
  CoverLayout,
  TextCenterLayout,
  ImageLeftTextRightLayout,
  TextLeftImageRightLayout,
  SplitTopBottomLayout,
  ImageFullLayout,
  SplitLayout,
  CenterImageDownTextLayout,
};

/**
 * Obtener layout por ID (con fallback)
 */
export function getLayout(layoutId: string): LayoutComponent {
  return layoutRegistry[layoutId as LayoutType] || layoutRegistry.TextCenterLayout;
}

/**
 * Validar si un layout ID es válido
 */
export function isValidLayoutId(layoutId: string): layoutId is LayoutType {
  return layoutId in layoutRegistry;
}

/**
 * Configuración de layouts
 */
export const layoutConfig = {
  firstPageOnly: ['CoverLayout'] as const,
  requiresImage: ['ImageFullLayout'] as const,
  requiresText: ['TextCenterLayout'] as const,
  default: 'TextCenterLayout' as const,
};

/**
 * Verificar si un layout se puede usar en una página
 */
export function canUseLayoutOnPage(layoutId: string, pageNumber: number): boolean {
  if (pageNumber === 1) return true;
  return !layoutConfig.firstPageOnly.includes(layoutId as any);
}

// Exportar tipo
export type { LayoutType };
/**
 * Exportaciones centralizadas del módulo de layouts
 */

// Componentes individuales
export { CoverLayout } from './components/CoverLayout';
export { TextCenterLayout } from './components/TextCenterLayout';
export { ImageLeftTextRightLayout } from './components/ImageLeftTextRightLayout';
export { TextLeftImageRightLayout } from './components/TextLeftImageRightLayout';
export { SplitTopBottomLayout } from './components/SplitTopBottomLayout';
export { ImageFullLayout } from './components/ImageFullLayout';
export { SplitLayout } from './components/SplitLayout';
export { CenterImageDownTextLayout } from './components/CenterImageDownTextLayout';
export { InteractiveLayout } from './components/InteractiveLayout';
export { PageRenderer } from './components/PageRenderer';

// Registry
export {
  layoutRegistry,
  getLayout,
  isValidLayoutId,
  availableLayoutIds,
  layoutConfig,
  canUseLayoutOnPage,
  type LayoutComponent,
  type LayoutType,
} from './registry';

// Definitions
export {
  LAYOUT_DEFINITIONS,
  getLayoutDefinition,
  getLayoutsByCategory,
  type LayoutDefinition,
} from './layoutDefinitions';
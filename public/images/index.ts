/**
 * Public Images Export
 * @file public/images/index.ts
 * @description Re-exports image configuration from infrastructure
 *
 * Prefer importing directly from: @/src/infrastructure/config/images.config
 */

export {
  imagesConfig as images,
  getImageUrl,
  type ImageCategory,
  type ImageKey,
} from '@/src/infrastructure/config/images.config';

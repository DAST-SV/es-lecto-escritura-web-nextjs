/**
 * UBICACIÓN: src/core/domain/entities/index.ts
 * 
 * Exportación centralizada de entidades del dominio
 */

export { Book } from './Book.entity';
export { Page } from './Page.entity';

export type { BookMetadata } from './Book.entity';
export type { 
  LayoutType, 
  BackgroundType, 
  PageContent, 
  PageFiles 
} from './Page.entity';
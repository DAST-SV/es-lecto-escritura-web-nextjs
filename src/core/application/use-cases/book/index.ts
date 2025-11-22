/**
 * UBICACIÓN: src/core/application/use-cases/book/index.ts
 * 
 * Exportación centralizada de casos de uso de libros
 */

export { SaveBookUseCase } from './SaveBook.usecase';
export { LoadBookUseCase } from './LoadBook.usecase';

export type { SaveBookDTO, SaveBookResult } from './SaveBook.usecase';
export type { LoadBookDTO, LoadBookResult } from './LoadBook.usecase';
// ============================================
// src/core/domain/repositories/IRouteTranslationRepository.ts
export interface IRouteTranslationRepository {
  /**
   * Obtiene la ruta traducida para un pathname y locale
   */
  getTranslatedPath(pathname: string, locale: string): Promise<string>;

  /**
   * Obtiene todas las traducciones de una ruta
   */
  getAllTranslations(pathname: string): Promise<Record<string, string>>;
}
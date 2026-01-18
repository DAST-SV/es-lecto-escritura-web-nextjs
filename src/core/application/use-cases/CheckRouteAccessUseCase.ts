// ============================================
// ARCHIVO: src/core/application/use-cases/CheckRouteAccessUseCase.ts
// ACCIÓN: REEMPLAZAR COMPLETO
// CAMBIO: Renombrar pathname a translatedPath para claridad
// ============================================

import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';
import { LanguageCode } from '@/src/core/domain/entities/Permission';

export class CheckRouteAccessUseCase {
  constructor(private permissionRepository: IPermissionRepository) {}

  /**
   * Verifica si un usuario puede acceder a una ruta
   * @param userId - ID del usuario
   * @param translatedPath - Ruta TRADUCIDA (ej: /biblioteca, /library, /bibliotheque)
   * @param languageCode - Código de idioma actual
   */
  async execute(
    userId: string | undefined,
    translatedPath: string,  // ✅ RENOMBRADO para claridad
    languageCode: LanguageCode = 'es'
  ): Promise<boolean> {
    // Si no hay usuario, solo puede acceder a rutas públicas
    if (!userId) {
      return this.permissionRepository.canAccessRoute('', translatedPath, languageCode);
    }

    // Verificar acceso usando la función de Supabase
    return this.permissionRepository.canAccessRoute(userId, translatedPath, languageCode);
  }
}
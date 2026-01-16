// ============================================
// src/core/application/use-cases/CheckRouteAccessUseCase.ts
// ✅ CORREGIDO - Tipos correctos
// ============================================

import { IPermissionRepository } from '@/src/core/domain/repositories/IPermissionRepository';
import { LanguageCode } from '@/src/core/domain/entities/Permission';

export class CheckRouteAccessUseCase {
  constructor(private permissionRepository: IPermissionRepository) {}

  async execute(
    userId: string | undefined,
    pathname: string,
    languageCode: LanguageCode = 'es'
  ): Promise<boolean> {
    // Si no hay usuario, solo puede acceder a rutas públicas
    if (!userId) {
      return this.permissionRepository.canAccessRoute('', pathname, languageCode);
    }

    // Verificar acceso usando la función de Supabase
    return this.permissionRepository.canAccessRoute(userId, pathname, languageCode);
  }
}
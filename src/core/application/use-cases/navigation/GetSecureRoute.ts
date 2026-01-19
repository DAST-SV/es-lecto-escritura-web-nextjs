// ============================================
// 2. APPLICATION LAYER - USE CASES
// ============================================

// src/core/application/use-cases/navigation/GetSecureRoute.ts
import { SecureRoute } from '@/src/core/domain/entities/SecureRoute';
import { IRouteTranslationRepository } from '@/src/core/domain/repositories/IRouteTranslationRepository';
import { CheckRouteAccessUseCase } from '../CheckRouteAccessUseCase';

export interface GetSecureRouteInput {
  physicalPath: string;
  locale: string;
  userId?: string;
  checkAccess?: boolean;
  translationKey?: string;
}

export class GetSecureRouteUseCase {
  constructor(
    private routeTranslationRepository: IRouteTranslationRepository,
    private checkRouteAccessUseCase: CheckRouteAccessUseCase,
    private translator: (key: string) => string
  ) {}

  async execute(input: GetSecureRouteInput): Promise<SecureRoute> {
    // 1. Obtener ruta traducida
    const translatedPath = await this.routeTranslationRepository.getTranslatedPath(
      input.physicalPath,
      input.locale
    );

    // 2. Verificar acceso (opcional)
    let hasAccess = true;
    if (input.checkAccess && input.userId) {
      hasAccess = await this.checkRouteAccessUseCase.execute(
        input.userId,
        translatedPath,
        input.locale as any
      );
    }

    // 3. Obtener texto traducido
    const displayText = input.translationKey 
      ? this.translator(input.translationKey)
      : input.physicalPath;

    // 4. Crear y retornar entidad
    return SecureRoute.create({
      physicalPath: input.physicalPath,
      translatedPath,
      displayText,
      locale: input.locale,
      hasAccess,
      isPublic: !input.checkAccess,
    });
  }
}
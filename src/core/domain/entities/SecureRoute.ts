// ============================================
// 1. DOMAIN LAYER
// ============================================

// src/core/domain/entities/SecureRoute.ts
export class SecureRoute {
  constructor(
    public readonly physicalPath: string,      // /library
    public readonly translatedPath: string,    // /biblioteca
    public readonly displayText: string,       // "Biblioteca"
    public readonly locale: string,            // es
    public readonly hasAccess: boolean,        // true/false
    public readonly isPublic: boolean = false
  ) {}

  /**
   * Obtiene la URL completa con locale
   */
  getFullPath(): string {
    return `/${this.locale}${this.translatedPath}`;
  }

  /**
   * Verifica si el link debe mostrarse
   */
  shouldRender(checkAccess: boolean): boolean {
    if (!checkAccess) return true;
    return this.isPublic || this.hasAccess;
  }

  /**
   * Factory: Crear desde datos crudos
   */
  static create(data: {
    physicalPath: string;
    translatedPath: string;
    displayText: string;
    locale: string;
    hasAccess: boolean;
    isPublic?: boolean;
  }): SecureRoute {
    return new SecureRoute(
      data.physicalPath,
      data.translatedPath,
      data.displayText,
      data.locale,
      data.hasAccess,
      data.isPublic ?? false
    );
  }
}
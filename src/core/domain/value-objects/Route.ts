// ============================================
// src/core/domain/value-objects/Route.ts
// ============================================

import { Locale } from './Locale';

export class Route {
  constructor(
    public readonly path: string,
    public readonly locale: Locale
  ) {}

  toLocalizedPath(): string {
    return `/${this.locale.code}${this.path}`;
  }

  static fromPathname(pathname: string): Route {
    const segments = pathname.split('/').filter(Boolean);
    const localeCode = segments[0] || 'es';
    const path = '/' + segments.slice(1).join('/');
    
    return new Route(path, Locale.fromString(localeCode));
  }
}
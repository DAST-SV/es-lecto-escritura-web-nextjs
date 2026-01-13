// ============================================
// src/infrastructure/services/routing/RouteScanner.ts
// Escanea las rutas REALES del sistema Next.js
// ============================================

import { readdir } from 'fs/promises';
import { join } from 'path';

interface ScannedRoute {
  path: string;
  type: 'page' | 'layout' | 'route';
  hasParams: boolean;
}

/**
 * Escanea el directorio app/[locale] para encontrar todas las rutas
 */
export class RouteScanner {
  /**
   * Escanear todas las rutas del sistema
   */
  static async scanRoutes(): Promise<string[]> {
    try {
      const appDir = join(process.cwd(), 'app', '[locale]');
      const routes: string[] = [];
      
      await this.scanDirectory(appDir, '', routes);
      
      // Ordenar y retornar
      return routes.sort();
    } catch (error) {
      console.error('Error escaneando rutas:', error);
      return this.getFallbackRoutes();
    }
  }

  /**
   * Escanear directorio recursivamente
   */
  private static async scanDirectory(
    baseDir: string,
    currentPath: string,
    routes: string[]
  ): Promise<void> {
    try {
      const entries = await readdir(baseDir, { withFileTypes: true });

      for (const entry of entries) {
        // Ignorar archivos especiales
        if (
          entry.name.startsWith('_') ||
          entry.name.startsWith('.') ||
          entry.name === 'api' ||
          entry.name === 'components' ||
          entry.name === 'layout.tsx' ||
          entry.name === 'loading.tsx' ||
          entry.name === 'error.tsx' ||
          entry.name === 'not-found.tsx'
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          // Es un directorio = segmento de ruta
          const segmentName = this.cleanSegmentName(entry.name);
          const newPath = currentPath + '/' + segmentName;
          const fullPath = join(baseDir, entry.name);

          // Verificar si tiene page.tsx
          const hasPage = await this.hasPageFile(fullPath);
          
          if (hasPage && !segmentName.startsWith('[')) {
            // Es una ruta válida (no dinámica)
            routes.push(newPath);
          }

          // Continuar escaneando subdirectorios
          await this.scanDirectory(fullPath, newPath, routes);
        }
      }
    } catch (error) {
      // Si no se puede leer el directorio, continuar
      console.warn(`No se pudo leer directorio: ${baseDir}`);
    }
  }

  /**
   * Verificar si un directorio tiene page.tsx
   */
  private static async hasPageFile(dirPath: string): Promise<boolean> {
    try {
      const entries = await readdir(dirPath);
      return entries.some(
        entry => entry === 'page.tsx' || entry === 'page.ts' || entry === 'page.jsx' || entry === 'page.js'
      );
    } catch {
      return false;
    }
  }

  /**
   * Limpiar nombre de segmento (remover paréntesis de grupos)
   */
  private static cleanSegmentName(name: string): string {
    // Remover grupos de rutas: (grupo) -> ''
    if (name.startsWith('(') && name.endsWith(')')) {
      return '';
    }
    return name;
  }

  /**
   * Rutas de respaldo si falla el escaneo
   */
  private static getFallbackRoutes(): string[] {
    return [
      '/',
      '/library',
      '/my-world',
      '/my-progress',
      '/admin',
      '/admin/routes',
      '/admin/route-permissions',
      '/admin/users/permissions',
    ];
  }
}
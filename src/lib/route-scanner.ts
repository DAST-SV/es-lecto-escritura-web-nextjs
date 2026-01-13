// ============================================
// src/lib/route-scanner.ts
// Escanea rutas REALES de app/[locale]
// ============================================

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export function scanSystemRoutes(): string[] {
  const routes: string[] = [];
  const appDir = join(process.cwd(), 'app', '[locale]');

  function scan(dir: string, basePath: string) {
    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        // Ignorar archivos y carpetas especiales
        if (
          entry.startsWith('_') ||
          entry.startsWith('.') ||
          entry === 'api' ||
          entry === 'components' ||
          entry.includes('layout') ||
          entry.includes('loading') ||
          entry.includes('error') ||
          entry.includes('not-found') ||
          entry.includes('template')
        ) {
          continue;
        }

        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Limpiar nombre (remover grupos de ruta)
          let cleanName = entry;
          if (entry.startsWith('(') && entry.endsWith(')')) {
            cleanName = ''; // Grupos de ruta no afectan la URL
          }

          // Ignorar rutas dinámicas [param]
          if (entry.startsWith('[') && entry.endsWith(']')) {
            continue;
          }

          const newPath = basePath + (cleanName ? '/' + cleanName : '');

          // Verificar si tiene page.tsx
          const hasPage = entries.some(e => 
            e === 'page.tsx' || e === 'page.ts' || e === 'page.jsx' || e === 'page.js'
          );

          if (hasPage && newPath) {
            routes.push(newPath);
          }

          // Escanear subdirectorio
          scan(fullPath, newPath);
        }
      }
    } catch (error) {
      console.error('Error escaneando:', dir, error);
    }
  }

  scan(appDir, '');
  
  // Agregar home siempre
  if (!routes.includes('/')) {
    routes.unshift('/');
  }

  return routes.sort();
}
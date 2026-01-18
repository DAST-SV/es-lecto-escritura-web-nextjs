// app/api/admin/scan-routes/route.ts
// API endpoint que escanea el filesystem buscando page.tsx

import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

interface ScannedRoute {
  pathname: string;
  displayName: string;
}

async function scanDirectory(
  baseDir: string,
  currentPath: string = '',
  routes: ScannedRoute[] = []
): Promise<ScannedRoute[]> {
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
        entry.name === 'not-found.tsx' ||
        entry.name === 'template.tsx'
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        // Es un directorio = posible segmento de ruta
        const segmentName = cleanSegmentName(entry.name);
        
        // Ignorar grupos de rutas vacíos: (grupo)
        if (segmentName === '') {
          const fullPath = join(baseDir, entry.name);
          await scanDirectory(fullPath, currentPath, routes);
          continue;
        }

        const newPath = currentPath + '/' + segmentName;
        const fullPath = join(baseDir, entry.name);

        // Verificar si tiene page.tsx
        const hasPage = await hasPageFile(fullPath);
        
        if (hasPage && !segmentName.startsWith('[')) {
          // Es una ruta válida (no dinámica)
          routes.push({
            pathname: newPath,
            displayName: generateDisplayName(newPath),
          });
        }

        // Continuar escaneando subdirectorios
        await scanDirectory(fullPath, newPath, routes);
      }
    }
  } catch (error) {
    console.warn(`No se pudo leer directorio: ${baseDir}`);
  }

  return routes;
}

async function hasPageFile(dirPath: string): Promise<boolean> {
  try {
    const entries = await readdir(dirPath);
    return entries.some(
      entry => entry === 'page.tsx' || entry === 'page.ts' || entry === 'page.jsx' || entry === 'page.js'
    );
  } catch {
    return false;
  }
}

function cleanSegmentName(name: string): string {
  // Remover grupos de rutas: (grupo) -> ''
  if (name.startsWith('(') && name.endsWith(')')) {
    return '';
  }
  return name;
}

function generateDisplayName(pathname: string): string {
  // Convertir /my-world a "My World"
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'home';
  
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function GET() {
  try {
    const appDir = join(process.cwd(), 'app', '[locale]');
    const routes = await scanDirectory(appDir);

    // Ordenar alfabéticamente
    routes.sort((a, b) => a.pathname.localeCompare(b.pathname));

    return NextResponse.json({
      success: true,
      routes,
      count: routes.length,
    });

  } catch (error: any) {
    console.error('Error scanning routes:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      routes: [],
    }, { status: 500 });
  }
}
// ============================================
// src/infrastructure/middleware/i18n.middleware.ts
// ============================================

import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from '@/src/infrastructure/config/routing.config';
import { updateSession } from '@/src/infrastructure/middleware/auth.middleware';
import { DynamicRoutingService } from '@/src/infrastructure/services/routing/DynamicRoutingService';

// Cache de rutas en memoria (se limpia en cada deploy)
let routesCache: Record<string, any> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function getRoutes() {
  const now = Date.now();
  
  // Usar cache si está fresco
  if (routesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return routesCache;
  }

  // Cargar rutas dinámicas
  routesCache = await DynamicRoutingService.loadAllRoutes();
  cacheTimestamp = now;
  
  return routesCache;
}

export async function middleware(request: NextRequest) {
  // Cargar rutas dinámicas
  const pathnames = await getRoutes();
  
  // Crear middleware con rutas dinámicas
  const handleI18nRouting = createMiddleware({
    ...routing,
    pathnames: pathnames as any,
  });

  const response = handleI18nRouting(request);
  return await updateSession(request, response);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
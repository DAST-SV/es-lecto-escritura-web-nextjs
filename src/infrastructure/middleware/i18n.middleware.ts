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

async function getRoutes(): Promise<Record<string, any>> {
  const now = Date.now();
  
  // Usar cache si está fresco
  if (routesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return routesCache;
  }

  try {
    // Cargar rutas dinámicas
    routesCache = await DynamicRoutingService.loadAllRoutes();
    cacheTimestamp = now;
    
    console.log('✅ Rutas cargadas:', Object.keys(routesCache).length);
    return routesCache;
  } catch (error) {
    console.error('❌ Error cargando rutas, usando fallback:', error);
    
    // Fallback: rutas básicas hardcoded
    return {
      '/': { es: '/', en: '/', fr: '/' },
      '/auth/login': { es: '/auth/ingresar', en: '/auth/login', fr: '/auth/connexion' },
      '/auth/register': { es: '/auth/registro', en: '/auth/register', fr: '/auth/inscription' },
      '/library': { es: '/biblioteca', en: '/library', fr: '/bibliotheque' },
      '/my-world': { es: '/mi-mundo', en: '/my-world', fr: '/mon-monde' },
      '/my-progress': { es: '/mi-progreso', en: '/my-progress', fr: '/mes-progres' },
      '/test-supabase': { es: '/test-supabase', en: '/test-supabase', fr: '/test-supabase' },
    };
  }
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
  
  // ✅ Pasar pathnames al middleware de auth
  return await updateSession(request, response, pathnames);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
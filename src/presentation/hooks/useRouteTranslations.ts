// ============================================
// src/presentation/hooks/useRouteTranslations.ts
// Hook TanStack Query para traducciones de rutas (client-side)
// ============================================

'use client';

import { useQuery } from '@tanstack/react-query';
import type { RouteTranslationsMap } from '@/src/infrastructure/utils/resolve-localized-href';

async function fetchRouteTranslations(): Promise<RouteTranslationsMap> {
  const res = await fetch('/api/routes/translations');
  if (!res.ok) return {};
  const data = await res.json();
  return data.translations || {};
}

export function useRouteTranslations() {
  return useQuery<RouteTranslationsMap>({
    queryKey: ['route-translations'],
    queryFn: fetchRouteTranslations,
    staleTime: 5 * 60 * 1000,     // 5 min stale
    gcTime: 30 * 60 * 1000,        // 30 min en cache
    refetchOnWindowFocus: false,
  });
}

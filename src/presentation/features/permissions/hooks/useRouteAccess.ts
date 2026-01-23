// ============================================
// ARCHIVO: src/presentation/features/permissions/hooks/useRouteAccess.ts
// ACCIÓN: REEMPLAZAR COMPLETO
// CAMBIO: Renombrar pathname a translatedPath
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { LanguageCode } from '@/src/core/domain/entities/Permission';

interface UseRouteAccessProps {
  translatedPath: string;  // ✅ RENOMBRADO
  languageCode?: LanguageCode;
}

interface UseRouteAccessReturn {
  canAccess: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para verificar acceso a rutas en el cliente
 * 
 * ✅ IMPORTANTE: translatedPath debe ser la ruta TRADUCIDA actual
 * Ejemplo: Si estás en /es/biblioteca, pasa "/biblioteca"
 */
export function useRouteAccess({ 
  translatedPath,  // ✅ RENOMBRADO
  languageCode = 'es' 
}: UseRouteAccessProps): UseRouteAccessReturn {
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();

        // Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setCanAccess(false);
            setLoading(false);
          }
          return;
        }

        // ✅ CAMBIO: p_translated_path
        const { data, error: rpcError } = await supabase.rpc('can_access_route', {
          p_user_id: user.id,
          p_translated_path: translatedPath,  // ✅ CAMBIADO
          p_language_code: languageCode,
        });

        if (rpcError) {
          throw new Error(rpcError.message);
        }

        if (mounted) {
          setCanAccess(data === true);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error checking route access:', err);
        if (mounted) {
          setError(err.message || 'Error al verificar acceso');
          setCanAccess(false);
          setLoading(false);
        }
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [translatedPath, languageCode]);  // ✅ CAMBIADO

  return { canAccess, loading, error };
}
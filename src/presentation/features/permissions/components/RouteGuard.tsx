// ============================================
// ARCHIVO: src/presentation/components/RouteGuard.tsx
// ACCIÓN: REEMPLAZAR COMPLETO
// CAMBIO: Usar pathname SIN convertir (ya viene traducido)
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface RouteGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RouteGuard({ children, redirectTo = '/error?code=403' }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname(); // /es/admin/permisos-usuario
  const locale = useLocale(); // es
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        setIsChecking(true);
        const supabase = createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log('❌ [RouteGuard] No autenticado');
          if (mounted) {
            router.push(`/${locale}/auth/login?redirect=${pathname}`);
          }
          return;
        }

        // ✅ CORRECCIÓN: Extraer ruta traducida correctamente
        // pathname = "/es/admin/permisos-usuario"
        // Queremos: "/admin/permisos-usuario"
        const translatedPath = pathname.replace(`/${locale}`, '') || '/';

        console.log('🔍 [RouteGuard]', {
          pathname,
          locale,
          translatedPath,
          userId: user.id
        });

        // ✅ Verificar con RUTA TRADUCIDA
        const { data: canAccess, error: accessError } = await supabase.rpc('can_access_route', {
          p_user_id: user.id,
          p_translated_path: translatedPath,  // /admin/permisos-usuario
          p_language_code: locale,            // es
        });

        if (accessError) {
          console.error('❌ [RouteGuard] Error checking access:', accessError);
          if (mounted) {
            router.push(redirectTo);
          }
          return;
        }

        console.log('📊 [RouteGuard] Resultado:', { canAccess });

        if (!canAccess) {
          console.log(`🚫 [RouteGuard] Acceso DENEGADO: ${translatedPath} (${locale})`);
          if (mounted) {
            router.push(redirectTo);
          }
          return;
        }

        console.log(`✅ [RouteGuard] Acceso PERMITIDO: ${translatedPath} (${locale})`);
        if (mounted) {
          setHasAccess(true);
          setIsChecking(false);
        }

      } catch (error) {
        console.error('❌ [RouteGuard] Error fatal:', error);
        if (mounted) {
          router.push(redirectTo);
        }
      }
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, [pathname, locale, router, redirectTo]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
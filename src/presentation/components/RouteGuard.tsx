// ============================================
// ARCHIVO: src/presentation/components/RouteGuard.tsx
// ACCIÓN: REEMPLAZAR COMPLETO
// CAMBIO: Verificar con ruta traducida directamente
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
  const pathname = usePathname(); // /es/exclusive
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
          console.log('❌ No autenticado');
          if (mounted) {
            router.push(`/${locale}/auth/login?redirect=${pathname}`);
          }
          return;
        }

        // ✅ Extraer ruta traducida (sin locale)
        const pathParts = pathname.split('/').filter(Boolean);
        const translatedPath = '/' + pathParts.slice(1).join('/') || '/';

        console.log('🔍 [RouteGuard]', {
          pathname,
          translatedPath,
          locale,
          userId: user.id
        });

        // ✅ Verificar con RUTA TRADUCIDA
        const { data: canAccess, error: accessError } = await supabase.rpc('can_access_route', {
          p_user_id: user.id,
          p_translated_path: translatedPath,  // ✅ /exclusive, /exclusivo, etc
          p_language_code: locale,            // ✅ es, en, fr, it
        });

        if (accessError) {
          console.error('❌ Error checking access:', accessError);
          if (mounted) {
            router.push(redirectTo);
          }
          return;
        }

        console.log('📊 [RouteGuard] Resultado:', { canAccess });

        if (!canAccess) {
          console.log(`🚫 Acceso DENEGADO: ${translatedPath} (${locale})`);
          if (mounted) {
            router.push(redirectTo);
          }
          return;
        }

        console.log(`✅ Acceso PERMITIDO: ${translatedPath} (${locale})`);
        if (mounted) {
          setHasAccess(true);
          setIsChecking(false);
        }

      } catch (error) {
        console.error('❌ Error en RouteGuard:', error);
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
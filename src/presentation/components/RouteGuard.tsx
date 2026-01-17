// src/presentation/components/RouteGuard.tsx
// ✅ CORREGIDO: Con manejo de errores y logs

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface RouteGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RouteGuard({ children, redirectTo = '/error?code=403' }: RouteGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
  }, [pathname]);

  const checkAccess = async () => {
    try {
      console.log('🔐 RouteGuard checking access to:', pathname);
      
      // 1. Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('❌ No authenticated user');
        router.push('/auth/login');
        return;
      }

      console.log('✅ User authenticated:', user.email);

      // 2. Extraer el path sin locale
      const pathParts = pathname.split('/').filter(Boolean);
      const locale = pathParts[0]; // es, en, fr, it
      const pathWithoutLocale = '/' + pathParts.slice(1).join('/');

      console.log('📍 Path sin locale:', pathWithoutLocale);
      console.log('🌍 Locale:', locale);

      // 3. Verificar acceso con can_access_route
      const { data: canAccess, error: accessError } = await supabase.rpc('can_access_route', {
        p_user_id: user.id,
        p_pathname: pathWithoutLocale,
        p_language_code: locale,
      });

      console.log('📊 can_access_route response:', { canAccess, error: accessError });

      if (accessError) {
        console.error('❌ Error checking access:', accessError);
        router.push(redirectTo);
        return;
      }

      if (!canAccess) {
        console.log('🚫 Access DENIED to:', pathWithoutLocale);
        router.push(redirectTo);
        return;
      }

      console.log('✅ Access GRANTED to:', pathWithoutLocale);
      setIsAuthorized(true);
      setIsLoading(false);

    } catch (error) {
      console.error('❌ RouteGuard error:', error);
      router.push(redirectTo);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
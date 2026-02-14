// ============================================
// src/presentation/features/navigation/hooks/useAuth.ts
// ============================================
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { getCurrentLocale } from '@/src/presentation/hooks';

// Rutas públicas — el redirect en logout solo aplica si NO está en una de estas
const PUBLIC_PATHS = [
  '/', '/auth/login', '/auth/register', '/auth/callback',
  '/auth/forgot-password', '/auth/reset-password', '/auth/complete-profile', '/error',
  '/auth/ingresar', '/auth/registro', '/auth/connexion', '/auth/inscription',
];

function isPublicPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  return PUBLIC_PATHS.some(p => withoutLocale === p || withoutLocale.startsWith(p + '/'));
}

export const useAuthNavigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
    const onPrivateRoute =
      typeof window !== 'undefined' && !isPublicPath(window.location.pathname);

    // Si es ruta privada: navegar primero a / — la nueva página carga sin usuario
    // El signOut ocurre en paralelo; cuando la página / cargue, el middleware
    // ya no encontrará sesión válida.
    if (onPrivateRoute) {
      // Navegar a home ANTES de que onAuthStateChange actualice el navbar
      // Preservar el locale actual (ej. /en → no redirigir a /es)
      const locale = getCurrentLocale();
      window.location.replace(`/${locale}`);
      // signOut en background — las cookies se limpian antes de que / renderice
      const supabase = createClient();
      supabase.auth.signOut();
    } else {
      // En ruta pública: solo cerrar sesión, el navbar se actualiza por onAuthStateChange
      const supabase = createClient();
      await supabase.auth.signOut();
    }
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout: handleLogout,
  };
};

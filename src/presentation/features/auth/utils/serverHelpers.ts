// ============================================
// src/presentation/features/auth/utils/serverHelpers.ts
// Helpers para usar en Server Components
// ============================================
import type { User } from '@supabase/supabase-js';

/**
 * Obtener usuario actual en Server Component
 * NO uses casos de uso aquí, usa Supabase directamente
 */
export async function getCurrentUserServer(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

/**
 * Verificar si hay usuario autenticado en Server Component
 */
export async function isAuthenticatedServer(): Promise<boolean> {
  const user = await getCurrentUserServer();
  return user !== null;
}

/**
 * Obtener ID del usuario en Server Component
 */
export async function getUserIdServer(): Promise<string | null> {
  const user = await getCurrentUserServer();
  return user?.id || null;
}

/**
 * Obtener email del usuario en Server Component
 */
export async function getUserEmailServer(): Promise<string | null> {
  const user = await getCurrentUserServer();
  return user?.email || null;
}
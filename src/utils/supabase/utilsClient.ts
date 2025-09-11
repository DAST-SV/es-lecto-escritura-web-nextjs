import { createClient } from '@/src/utils/supabase/client'


/**
 * Crea un cliente de Supabase para el navegador.
 */
const  supabase = createClient()

/**
 * Obtener el ID del usuario actual desde la sesión en el navegador.
 * Retorna null si no hay usuario logueado.
 */
export async function getUserId(): Promise<string | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;
  return userData.user.id;
}

/**
 * Obtener el email del usuario actual desde la sesión en el navegador.
 * Retorna null si no hay usuario logueado.
 */
export async function getUserEmail(): Promise<string | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;
  return userData.user.email || "";
}

/**
 * Verifica si hay un usuario logueado.
 */
export async function isLoggedIn(): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  return !!userData.user;
}



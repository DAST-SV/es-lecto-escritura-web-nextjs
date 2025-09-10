import { getTranslations } from 'next-intl/server';

// Mapeo de errores de Supabase a claves de traducción
const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'invalid_credentials',
  'Email not confirmed': 'email_not_confirmed',
  'User not found': 'user_not_found',
  'Invalid email': 'invalid_email',
  'Password should be at least 6 characters': 'weak_password',
  'User already registered': 'email_already_registered',
  'Too many requests': 'too_many_requests',
};

export async function translateAuthError(errorMessage: string): Promise<string> {
  const t = await getTranslations('auth.errors');
  
  // Buscar la clave correspondiente al error de Supabase
  const errorKey = ERROR_MAP[errorMessage];
  
  if (errorKey) {
    return t(errorKey);
  }
  
  // Si no encontramos el error específico, retornar error genérico traducido
  return t('generic_error');
}
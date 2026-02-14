// ============================================
// src/presentation/actions/auth.actions.ts
// ============================================
'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getLocale } from "next-intl/server";
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/src/infrastructure/config/supabase.config';
import { SupabaseAuthRepository } from '@/src/infrastructure/repositories';
import { Login, Signup, LoginWithProvider, ResetPasswordForEmail, UpdatePassword } from '@/src/core/application/use-cases/auth';
import type { AuthState, OAuthProvider } from '@/src/core/domain/types/Auth.types';
import { TranslationService } from '@/src/infrastructure/services/i18n';

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const rememberMe = formData.get('rememberMe') === 'on';
  const supabase = await createServerSupabaseClient();
  const authRepository = new SupabaseAuthRepository(supabase);
  const loginUseCase = new Login(authRepository);

  const result = await loginUseCase.execute({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (result.error) {
    const errorMessage = result.error.message || 'Error desconocido';
    const translatedError = await TranslationService.translateAuthError(errorMessage);
    return { error: translatedError };
  }

  // Guardar preferencia de "recordar sesión" como cookie simple
  // El browser client la leerá para decidir si persistir o no la sesión
  const cookieStore = await (await import('next/headers')).cookies();
  cookieStore.set('sb_remember', rememberMe ? '1' : '0', {
    httpOnly: false, // Necesita ser legible desde JS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined, // 30 días o sesión de browser
  });

  revalidatePath('/', 'layout');

  const headersList = await headers();
  const referer = headersList.get('referer') || '';
  const url = new URL(referer || 'http://localhost');
  const redirectParam = url.searchParams.get('redirect');

  // Extraer locale directamente de la URL del referer (ej. /en/auth/login → 'en')
  // getLocale() puede retornar el locale de la cookie NEXT_LOCALE que no refleja la URL actual
  const LOCALES = ['es', 'en', 'fr', 'it'];
  const urlSegments = url.pathname.split('/').filter(Boolean);
  const localeFromUrl = urlSegments[0] && LOCALES.includes(urlSegments[0]) ? urlSegments[0] : null;
  const locale = localeFromUrl ?? await getLocale();

  // Si hay redirect guardado por el middleware, usarlo (ya es la ruta traducida canónica)
  // Si no, resolver la ruta de library en el idioma correcto desde la misma tabla que el navbar
  let fallbackRoute = `/${locale}`;
  if (!redirectParam) {
    const { data: keyData } = await supabase
      .schema('app')
      .from('translation_keys')
      .select('id')
      .eq('namespace_slug', 'nav')
      .eq('key_name', 'library.href')
      .single();

    if (keyData) {
      const { data } = await supabase
        .schema('app')
        .from('translations')
        .select('value')
        .eq('translation_key_id', keyData.id)
        .eq('language_code', locale)
        .single();
      if (data?.value) {
        fallbackRoute = `/${locale}${data.value}`;
      }
    }
  }

  redirect(redirectParam || fallbackRoute);
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createServerSupabaseClient();
  const authRepository = new SupabaseAuthRepository(supabase);
  const signupUseCase = new Signup(authRepository);

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  // Validate required fields
  if (!name || !email || !password || !role) {
    return { error: 'Todos los campos son obligatorios' };
  }

  const result = await signupUseCase.execute({
    email,
    password,
    name,
    role,
  });

  if (result.error) {
    const errorMessage = result.error.message || 'Error desconocido';
    const translatedError = await TranslationService.translateAuthError(errorMessage);
    return {
      error: translatedError,
      email
    };
  }

  // After successful signup, assign the role to the user
  if (result.user) {
    try {
      const { data: roleData } = await supabase
        .schema('app')
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();

      if (roleData) {
        await supabase
          .schema('app')
          .from('user_roles')
          .insert({
            user_id: result.user.id,
            role_id: roleData.id,
            is_active: true,
            assigned_by: result.user.id,
          });
      }
    } catch (roleError) {
      console.error('Error assigning role:', roleError);
    }
  }

  revalidatePath('/', 'layout');
  const locale = await getLocale();

  redirect(`/${locale}/auth/login?registered=true`);
}

export async function loginWithProvider(provider: OAuthProvider) {
  const supabase = await createServerSupabaseClient();
  const authRepository = new SupabaseAuthRepository(supabase);
  const loginWithProviderUseCase = new LoginWithProvider(authRepository);

  const headersList = await headers();
  const referer = headersList.get('referer') || '';
  const host = headersList.get('host') || 'localhost:3000';
  const proto = host.startsWith('localhost') ? 'http' : 'https';
  const baseUrl = referer ? new URL(referer).origin : `${proto}://${host}`;
  const refererUrl = referer ? new URL(referer) : null;
  const redirectParam = refererUrl ? refererUrl.searchParams.get('redirect') : null;

  // Extraer locale de la URL del referer
  const LOCALES = ['es', 'en', 'fr', 'it'];
  const urlSegments = refererUrl?.pathname.split('/').filter(Boolean) ?? [];
  const localeFromUrl = urlSegments[0] && LOCALES.includes(urlSegments[0]) ? urlSegments[0] : null;
  const locale = localeFromUrl ?? await getLocale();

  const finalDestination = redirectParam || `/${locale}`;
  const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(finalDestination)}`;
  console.log('[OAuth] redirectTo:', redirectTo);

  try {
    const authUrlResponse = await loginWithProviderUseCase.execute(provider, redirectTo);
    redirect(authUrlResponse.url);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const translatedError = await TranslationService.translateAuthError(errorMessage);
    throw new Error(translatedError);
  }
}

export async function forgotPassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createServerSupabaseClient();
  const authRepository = new SupabaseAuthRepository(supabase);
  const resetUseCase = new ResetPasswordForEmail(authRepository);

  const email = formData.get('email') as string;

  if (!email) {
    return { error: 'El correo electronico es obligatorio' };
  }

  const locale = await getLocale();
  const headersList = await headers();
  const referer = headersList.get('referer') || '';
  const url = new URL(referer || 'http://localhost');
  const baseUrl = url.origin;
  const redirectTo = `${baseUrl}/${locale}/auth/reset-password`;

  const { error } = await resetUseCase.execute(email, redirectTo);

  if (error) {
    const translatedError = await TranslationService.translateAuthError(error.message);
    return { error: translatedError };
  }

  return { success: true };
}

export async function resetPassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createServerSupabaseClient();
  const authRepository = new SupabaseAuthRepository(supabase);
  const updateUseCase = new UpdatePassword(authRepository);

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    return { error: 'Todos los campos son obligatorios' };
  }

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden' };
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  const result = await updateUseCase.execute(password);

  if (result.error) {
    const translatedError = await TranslationService.translateAuthError(result.error.message);
    return { error: translatedError };
  }

  return { success: true };
}

export async function assignRole(role: string): Promise<AuthState> {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Usuario no autenticado' };
  }

  // Check if user already has a role
  const { data: existingRole } = await supabase
    .schema('app')
    .from('user_roles')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (existingRole) {
    return { success: true };
  }

  // Find the role_id
  const { data: roleData, error: roleError } = await supabase
    .schema('app')
    .from('roles')
    .select('id')
    .eq('name', role)
    .single();

  if (roleError || !roleData) {
    return { error: 'Rol no encontrado' };
  }

  // Assign the role
  const { error: assignError } = await supabase
    .schema('app')
    .from('user_roles')
    .insert({
      user_id: user.id,
      role_id: roleData.id,
      is_active: true,
      assigned_by: user.id,
    });

  if (assignError) {
    return { error: 'Error al asignar el rol' };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

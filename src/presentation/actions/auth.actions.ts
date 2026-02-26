// ============================================
// src/presentation/actions/auth.actions.ts
// ✅ FIX: Admin client para assignRole, locales dinámicos
// ============================================
'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getLocale } from "next-intl/server";
import { headers } from 'next/headers';
import { createServerSupabaseClient, getSupabaseAdmin } from '@/src/infrastructure/config/supabase.config';
import { SupabaseAuthRepository } from '@/src/infrastructure/repositories';
import { Login, Signup, LoginWithProvider, ResetPasswordForEmail, UpdatePassword } from '@/src/core/application/use-cases/auth';
import type { AuthState, OAuthProvider } from '@/src/core/domain/types/Auth.types';
import { TranslationService } from '@/src/infrastructure/services/i18n';
import { locales as SUPPORTED_LOCALES } from '@/src/infrastructure/config/generated-locales';

/**
 * Extrae el locale de una URL del referer
 */
function extractLocaleFromUrl(url: URL): string | null {
  const segments = url.pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  if (maybeLocale && (SUPPORTED_LOCALES as readonly string[]).includes(maybeLocale)) {
    return maybeLocale;
  }
  return null;
}

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
  const cookieStore = await (await import('next/headers')).cookies();
  cookieStore.set('sb_remember', rememberMe ? '1' : '0', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined,
  });

  revalidatePath('/', 'layout');

  const headersList = await headers();
  const referer = headersList.get('referer') || '';
  const url = new URL(referer || 'http://localhost');
  const redirectParam = url.searchParams.get('redirect');

  const locale = extractLocaleFromUrl(url) ?? await getLocale();

  // Resolver fallback route desde traducciones
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

  // ✅ Usar admin client para asignar rol (bypasa RLS)
  if (result.user) {
    try {
      const admin = getSupabaseAdmin();
      const { data: roleData } = await admin
        .schema('app')
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();

      if (roleData) {
        await admin
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

  const locale = (refererUrl ? extractLocaleFromUrl(refererUrl) : null) ?? await getLocale();

  const finalDestination = redirectParam || `/${locale}`;
  const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(finalDestination)}`;

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

  // Verificar usuario autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Usuario no autenticado' };
  }

  // ✅ Usar admin client para operaciones en user_roles (bypasa RLS)
  const admin = getSupabaseAdmin();

  // Verificar si ya tiene rol
  const { data: existingRole } = await admin
    .schema('app')
    .from('user_roles')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (existingRole) {
    return { success: true };
  }

  // Primero: listar TODOS los roles disponibles para diagnóstico
  const { data: allRoles, error: listError } = await admin
    .schema('app')
    .from('roles')
    .select('id, name');

  if (listError) {
    console.error('[assignRole] Cannot query roles table:', listError.message, listError.code, listError.hint);
    return { error: `Error accediendo tabla de roles: ${listError.message}` };
  }

  if (!allRoles || allRoles.length === 0) {
    console.error('[assignRole] roles table is EMPTY');
    return { error: 'La tabla de roles está vacía. Ejecuta los seeds de la base de datos.' };
  }

  // Buscar role_id
  const roleData = allRoles.find((r: any) => r.name === role);

  if (!roleData) {
    const available = allRoles.map((r: any) => r.name).join(', ');
    console.error(`[assignRole] Role "${role}" not found. Available: ${available}`);
    return { error: `Rol "${role}" no encontrado. Disponibles: ${available}` };
  }

  // Asignar rol
  const { error: assignError } = await admin
    .schema('app')
    .from('user_roles')
    .insert({
      user_id: user.id,
      role_id: roleData.id,
      is_active: true,
      assigned_by: user.id,
    });

  if (assignError) {
    console.error('[assignRole] Insert failed:', assignError.message, assignError.code, assignError.details);
    return { error: `Error al asignar rol: ${assignError.message}` };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

// ============================================
// src/presentation/actions/auth.actions.ts
// ============================================
'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getLocale } from "next-intl/server";
import { headers, cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/src/infrastructure/config/supabase.config';
import { SupabaseAuthRepository } from '@/src/infrastructure/repositories';
import { Login, Signup, LoginWithProvider, ResetPasswordForEmail, UpdatePassword } from '@/src/core/application/use-cases/auth';
import type { AuthState, OAuthProvider } from '@/src/core/domain/types/Auth.types';
import { TranslationService } from '@/src/infrastructure/services/i18n';

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createServerSupabaseClient();
  const authRepository = new SupabaseAuthRepository(supabase);
  const loginUseCase = new Login(authRepository);

  const rememberMe = formData.get('rememberMe') === 'on';

  const result = await loginUseCase.execute({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (result.error) {
    const errorMessage = result.error.message || 'Error desconocido';
    const translatedError = await TranslationService.translateAuthError(errorMessage);
    return { error: translatedError };
  }

  // Remember me: control session cookie persistence
  if (!rememberMe) {
    // Session cookie (expires when browser closes)
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.includes('auth-token') || cookie.name.includes('sb-')) {
        cookieStore.set(cookie.name, cookie.value, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          // No maxAge = session cookie (dies when browser closes)
        });
      }
    }
  }
  // If rememberMe is true, Supabase default cookie behavior persists (7 days)

  revalidatePath('/', 'layout');

  const headersList = await headers();
  const referer = headersList.get('referer') || '';
  const url = new URL(referer || 'http://localhost');
  const redirectParam = url.searchParams.get('redirect');
  const locale = await getLocale();
  const redirectTo = redirectParam || `/${locale}/library`;

  redirect(redirectTo);
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

  const locale = await getLocale();
  const headersList = await headers();
  const referer = headersList.get('referer') || '';
  const url = new URL(referer || 'http://localhost');
  const redirectParam = url.searchParams.get('redirect');
  const baseUrl = url.origin;
  const finalDestination = redirectParam || `/${locale}/library`;
  const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(finalDestination)}`;

  try {
    const authUrlResponse = await loginWithProviderUseCase.execute(provider, redirectTo);
    redirect(authUrlResponse.url);
  } catch (error) {
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

// ============================================
// src/presentation/actions/auth.actions.ts
// ✅ SOLUCIÓN: Usar createServerSupabaseClient
// ============================================
'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getLocale } from "next-intl/server";
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/src/infrastructure/config/supabase.config'; // ✅
import { SupabaseAuthRepository } from '@/src/infrastructure/repositories';
import { Login, Signup, LoginWithProvider } from '@/src/core/application/use-cases/auth';
import type { AuthState, OAuthProvider } from '@/src/core/domain/types/Auth.types';
import { TranslationService } from '@/src/infrastructure/services/i18n';

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createServerSupabaseClient(); // ✅ Cliente servidor
  const authRepository = new SupabaseAuthRepository(supabase); // ✅ Inyectar
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
  const supabase = await createServerSupabaseClient(); // ✅
  const authRepository = new SupabaseAuthRepository(supabase); // ✅
  const signupUseCase = new Signup(authRepository);

  const result = await signupUseCase.execute({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (result.error) {
    const errorMessage = result.error.message || 'Error desconocido';
    const translatedError = await TranslationService.translateAuthError(errorMessage);
    return { error: translatedError };
  }

  revalidatePath('/', 'layout');
  const locale = await getLocale();
  redirect(`/${locale}/library`);
}

export async function loginWithProvider(provider: OAuthProvider) {
  const supabase = await createServerSupabaseClient(); // ✅
  const authRepository = new SupabaseAuthRepository(supabase); // ✅
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
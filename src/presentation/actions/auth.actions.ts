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
      // Find the role_id for the selected role
      const { data: roleData } = await supabase
        .schema('app')
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();

      if (roleData) {
        // Assign the role to the user
        await supabase
          .schema('app')
          .from('user_roles')
          .insert({
            user_id: result.user.id,
            role_id: roleData.id,
            is_active: true,
            assigned_by: result.user.id, // Self-assigned on registration
          });
      }
    } catch (roleError) {
      console.error('Error assigning role:', roleError);
      // Don't fail the signup if role assignment fails
    }
  }

  revalidatePath('/', 'layout');
  const locale = await getLocale();

  // Redirect to login with success message
  redirect(`/${locale}/auth/login?registered=true`);
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
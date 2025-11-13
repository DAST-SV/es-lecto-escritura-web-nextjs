// ==========================================
// 1. src/utils/supabase/actions/auth.ts
// ==========================================
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/src/utils/supabase/server'
import { translateAuthError } from '@/src/utils/supabase/auth-errors'
import { getLocale } from "next-intl/server"
import { headers } from 'next/headers'

export interface AuthState {
  error?: string;
  success?: boolean;
  email?: string;
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const translatedError = await translateAuthError(error.message);
    return {
      error: translatedError,
      email: data.email,
      success: false
    };
  }

  // Revalidar para actualizar server components
  revalidatePath('/', 'layout')
  
  // Obtener redirect desde URL
  const headersList = await headers()
  const referer = headersList.get('referer') || ''
  const url = new URL(referer || 'http://localhost')
  const redirectParam = url.searchParams.get('redirect')
  
  const locale = await getLocale()
  const redirectTo = redirectParam || `/${locale}/library`
  
  // Redirect directo
  redirect(redirectTo)
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    const translatedError = await translateAuthError(error.message);
    return {
      error: translatedError,
      email: data.email,
      success: false
    };
  }

  revalidatePath('/', 'layout')
  const locale = await getLocale()
  redirect(`/${locale}/library`)
}

export async function loginWithProvider(
  provider: "google" | "apple" | "azure" | "facebook" | "twitter" | "spotify"
) {
  const supabase = await createClient()
  const locale = await getLocale()
  
  // Obtener redirect desde URL
  const headersList = await headers()
  const referer = headersList.get('referer') || ''
  const url = new URL(referer || 'http://localhost')
  const redirectParam = url.searchParams.get('redirect')
  
  const baseUrl = url.origin
  const finalDestination = redirectParam || `/${locale}/library`
  
  // Callback que incluye el destino final
  const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(finalDestination)}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider === "azure" ? "azure" : provider,
    options: {
      redirectTo,
    },
  })

  if (error) {
    throw new Error(await translateAuthError(error.message))
  }

  redirect(data.url);
}
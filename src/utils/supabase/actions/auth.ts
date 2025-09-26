'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/src/utils/supabase/server'
import { translateAuthError } from '@/src/utils/supabase/auth-errors'
import { headers } from "next/headers"
import { getLocale } from "next-intl/server"

export interface AuthState {
  error?: string;
  email?: string;  // ← NUEVO
  password?: string; // ← NUEVO (opcional, por seguridad mejor no)
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const locale = await getLocale()
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
      email: data.email  // ← Preservar el email
      // password: data.password // ← NO recomendado por seguridad
    };
  }

  revalidatePath('/', 'layout')
  redirect(`/${locale}/explore-content`)
}

export async function loginWithProvider(
  provider: "google" | "apple" | "azure" | "facebook" | "twitter" | "spotify",
  baseUrl: string
) {
  const supabase = await createClient()
  const locale = await getLocale()
  const redirectTo = `${baseUrl}/${locale}/pages-my-books`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider === "azure" ? "azure" : provider,
    options: {
      redirectTo,
    },
  })

  if (error) {
    throw new Error(await translateAuthError(error.message))
  }

  redirect(data.url)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    // redirect('/error')
    return;
  }

  revalidatePath('/', 'layout')
  redirect('/es/pages-my-books')
}
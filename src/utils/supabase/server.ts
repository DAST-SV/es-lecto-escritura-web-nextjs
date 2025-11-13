import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(rememberMe: boolean = false) {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const baseOptions = {
                ...options,
                sameSite: 'lax' as const,
                secure: true,
                httpOnly: true,
                path: '/',
              }

              // Si el usuario marcó "Recordar sesión", extendemos la expiración
              const finalOptions = rememberMe
                ? { ...baseOptions, maxAge: 60 * 60 * 24 * 30 } // 30 días
                : baseOptions

              cookieStore.set(name, value, finalOptions)
            })
          } catch {
            // Si se ejecuta en un Server Component puro, se ignora (middleware se encarga)
          }
        },
      },
    }
  )
}

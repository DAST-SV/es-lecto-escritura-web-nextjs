// src/infrastructure/config/supabase.config.ts

import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Singleton en window.__sb para sobrevivir hot-reloads del módulo en dev
// window es único por pestaña → una sola instancia de GoTrueClient
const WINDOW_KEY = '__sb_browser_client__';

export function createClient() {
  // Esta función SOLO debe llamarse desde el browser (client components)
  // Para servidor usar createServerSupabaseClient()
  if (typeof window === 'undefined') {
    throw new Error('[Supabase] createClient() llamado en servidor — usa createServerSupabaseClient()');
  }

  const w = window as any;
  if (!w[WINDOW_KEY]) {
    w[WINDOW_KEY] = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // Verificar "recordar sesión":
    // Si sb_remember=0 y es una nueva ventana del browser (sessionStorage vacío),
    // cerrar sesión automáticamente para simular sesión de solo-browser.
    const remember = document.cookie
      .split('; ')
      .find(row => row.startsWith('sb_remember='))
      ?.split('=')[1];

    if (remember === '0') {
      const sessionKey = '__sb_session_alive__';
      if (!sessionStorage.getItem(sessionKey)) {
        // Nueva ventana/tab del browser — cerrar sesión
        sessionStorage.setItem(sessionKey, '1');
        w[WINDOW_KEY].auth.signOut();
      } else {
        // Misma sesión de browser activa — mantener
        sessionStorage.setItem(sessionKey, '1');
      }
    }
  }

  return w[WINDOW_KEY] as ReturnType<typeof createBrowserClient>;
}

// ✅ Cliente para servidor (Server Components/Actions)
// IMPORTANTE: Esta función debe estar en un archivo separado o solo usarse en servidor
export async function createServerSupabaseClient() {
  // ❌ NO importar cookies aquí, hacerlo donde se use
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

// ✅ Admin client (solo servidor) - Lazy initialization para evitar errores en build time
let _supabaseAdmin: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';

    // Durante build time, las variables pueden no estar disponibles
    // Esto es normal y esperado — retornar cliente dummy silenciosamente
    if (!supabaseUrl || !supabaseKey) {
      // @ts-ignore
      return createSupabaseClient('https://dummy.supabase.co', 'dummy-key');
    }

    _supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseKey);
  }
  return _supabaseAdmin;
}

// Backward compatibility export
export const supabaseAdmin = getSupabaseAdmin();
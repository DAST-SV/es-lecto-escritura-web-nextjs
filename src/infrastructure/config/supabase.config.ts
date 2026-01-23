// src/infrastructure/config/supabase.config.ts

import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ✅ Cliente para browser (componentes cliente)
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

  // Durante build time, las variables pueden no estar disponibles
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[WARNING] Supabase environment variables not available for browser client (build time?)');
    // Durante build, retornar cliente dummy
    // @ts-ignore
    return createBrowserClient('https://dummy.supabase.co', 'dummy-key');
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
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
    // En ese caso, creamos un cliente dummy que no se usará
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[WARNING] Supabase environment variables not available (build time?)');
      // @ts-ignore - Durante build time, retornar cliente dummy
      return createSupabaseClient('https://dummy.supabase.co', 'dummy-key');
    }

    _supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseKey);
  }
  return _supabaseAdmin;
}

// Backward compatibility export
export const supabaseAdmin = getSupabaseAdmin();
// ============================================
// app/auth/callback/route.ts
// OAuth callback handler for Supabase Auth
// Checks if user has a role assigned, redirects to complete-profile if not
// ============================================

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/es/library';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
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
              // Ignore - called from Server Component
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has a role assigned
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: userRole } = await supabase
          .schema('app')
          .from('user_roles')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1)
          .single();

        if (!userRole) {
          // No role assigned — extract locale from the next param or default to 'es'
          const localeMatch = next.match(/^\/([a-z]{2})\//);
          const locale = localeMatch ? localeMatch[1] : 'es';
          const redirectAfter = encodeURIComponent(next);
          return NextResponse.redirect(`${origin}/${locale}/auth/complete-profile?redirect=${redirectAfter}`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If no code or error, redirect to login
  return NextResponse.redirect(`${origin}/es/auth/login?error=auth_callback_failed`);
}

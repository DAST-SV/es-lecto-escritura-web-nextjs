// app/api/v1/auth/session/route.ts
// API para verificar sesión activa

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/infrastructure/config/supabase.config';

/**
 * GET /api/v1/auth/session
 * Verifica si hay una sesión activa
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({
        session: null,
        valid: false,
      });
    }

    return NextResponse.json({
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at,
        expiresIn: session.expires_in,
        tokenType: session.token_type,
        user: {
          id: session.user.id,
          email: session.user.email,
        },
      },
      valid: true,
    });
  } catch (error) {
    console.error('API Error - GET /api/v1/auth/session:', error);
    return NextResponse.json(
      { error: 'Error al verificar sesión' },
      { status: 500 }
    );
  }
}

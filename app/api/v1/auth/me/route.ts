// app/api/v1/auth/me/route.ts
// API para obtener información del usuario autenticado

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/infrastructure/config/supabase.config';

/**
 * GET /api/v1/auth/me
 * Obtiene el usuario actualmente autenticado
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at != null,
        phone: user.phone,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        appMetadata: user.app_metadata,
        userMetadata: user.user_metadata,
      },
      authenticated: true,
    });
  } catch (error) {
    console.error('API Error - GET /api/v1/auth/me:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

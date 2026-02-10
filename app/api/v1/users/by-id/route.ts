// app/api/v1/users/by-id/route.ts
// API para obtener datos de usuario por UUID (para resolución de autores en modo edición)
// Usa el cliente admin para acceder a auth.users.raw_user_meta_data

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/infrastructure/config/supabase.config';

/**
 * GET /api/v1/users/by-id?id=UUID
 * Obtiene nombre y email de un usuario por su UUID usando el cliente admin
 * Solo devuelve campos no sensibles: displayName, email, avatarUrl
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID del usuario es requerido' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Usar la API admin de Supabase Auth para obtener datos del usuario
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !user) {
      // Fallback: intentar desde user_profiles
      const { data: profile } = await supabaseAdmin
        .schema('app')
        .from('user_profiles')
        .select('display_name, full_name, first_name, last_name, avatar_url')
        .eq('user_id', userId)
        .single();

      if (profile) {
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        const combined = [firstName, lastName].filter(Boolean).join(' ');
        const displayName = profile.display_name || profile.full_name || combined || userId.slice(0, 8);
        return NextResponse.json({
          userId,
          displayName,
          email: '',
          avatarUrl: profile.avatar_url || null,
        });
      }

      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Extraer nombre del metadata de OAuth
    const meta = user.user_metadata || {};
    const displayName =
      meta.full_name ||
      meta.name ||
      (user.email ? user.email.split('@')[0] : userId.slice(0, 8));

    const avatarUrl =
      meta.avatar_url ||
      meta.picture ||
      null;

    return NextResponse.json({
      userId: user.id,
      displayName,
      email: user.email || '',
      avatarUrl,
    });
  } catch (error) {
    console.error('API Error - GET /api/v1/users/by-id:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

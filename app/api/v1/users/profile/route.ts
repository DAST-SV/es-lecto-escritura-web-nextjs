// app/api/v1/users/profile/route.ts
// API para gestión del perfil del usuario autenticado

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/infrastructure/config/supabase.config';
import { UserProfileRepository } from '@/src/infrastructure/repositories/user-profiles/UserProfileRepository';

const profileRepository = new UserProfileRepository();

/**
 * GET /api/v1/users/profile
 * Obtiene el perfil del usuario autenticado
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const profile = await profileRepository.findByUserId(user.id);

    if (!profile) {
      return NextResponse.json(
        { profile: null, exists: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      profile: profile.toJSON ? profile.toJSON() : profile,
      exists: true,
    });
  } catch (error) {
    console.error('API Error - GET /api/v1/users/profile:', error);
    return NextResponse.json(
      { error: 'Error al obtener perfil' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/users/profile
 * Crea el perfil del usuario autenticado
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Verificar si ya existe un perfil
    const existingProfile = await profileRepository.findByUserId(user.id);
    if (existingProfile) {
      return NextResponse.json(
        { error: 'El perfil ya existe' },
        { status: 409 }
      );
    }

    const createData: Parameters<typeof profileRepository.create>[0] = {
      userId: user.id,
      displayName: body.displayName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
      bio: body.bio || undefined,
      avatarUrl: body.avatarUrl || user.user_metadata?.avatar_url || undefined,
      phoneNumber: body.phoneNumber || undefined,
      address: body.address || undefined,
      city: body.city || undefined,
      country: body.country || undefined,
      isPublic: body.isPublic ?? true,
      preferences: body.preferences || {},
    };

    // Solo agregar dateOfBirth si existe
    if (body.dateOfBirth) {
      createData.dateOfBirth = new Date(body.dateOfBirth);
    }

    const profile = await profileRepository.create(createData);

    return NextResponse.json({
      profile: profile.toJSON ? profile.toJSON() : profile,
      message: 'Perfil creado exitosamente',
    }, { status: 201 });
  } catch (error) {
    console.error('API Error - POST /api/v1/users/profile:', error);
    return NextResponse.json(
      { error: 'Error al crear perfil' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/users/profile
 * Actualiza el perfil del usuario autenticado
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Obtener el perfil existente
    const existingProfile = await profileRepository.findByUserId(user.id);
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    const profile = await profileRepository.update(existingProfile.id, {
      displayName: body.displayName,
      bio: body.bio,
      avatarUrl: body.avatarUrl,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      phoneNumber: body.phoneNumber,
      address: body.address,
      city: body.city,
      country: body.country,
      isPublic: body.isPublic,
      preferences: body.preferences,
    });

    return NextResponse.json({
      profile: profile.toJSON ? profile.toJSON() : profile,
      message: 'Perfil actualizado exitosamente',
    });
  } catch (error) {
    console.error('API Error - PUT /api/v1/users/profile:', error);
    return NextResponse.json(
      { error: 'Error al actualizar perfil' },
      { status: 500 }
    );
  }
}

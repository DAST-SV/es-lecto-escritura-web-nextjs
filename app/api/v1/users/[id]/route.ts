// app/api/v1/users/[id]/route.ts
// API para obtener perfil público de un usuario

import { NextRequest, NextResponse } from 'next/server';
import { UserProfileRepository } from '@/src/infrastructure/repositories/user-profiles/UserProfileRepository';

const profileRepository = new UserProfileRepository();

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/users/[id]
 * Obtiene el perfil público de un usuario
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID del usuario es requerido' },
        { status: 400 }
      );
    }

    const profile = await profileRepository.findByUserId(id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Solo devolver información pública
    if (!profile.isPublic) {
      return NextResponse.json({
        profile: {
          id: profile.id,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          isPublic: false,
        },
        limited: true,
      });
    }

    return NextResponse.json({
      profile: profile.toJSON ? profile.toJSON() : profile,
      limited: false,
    });
  } catch (error) {
    console.error('API Error - GET /api/v1/users/[id]:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

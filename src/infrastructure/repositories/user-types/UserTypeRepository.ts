// ============================================
// 9. src/infrastructure/repositories/user-types/UserTypeRepository.ts
// ============================================

import { supabaseAdmin } from '@/src/utils/supabase/admin';
import { IUserTypeRepository } from '@/src/core/domain/repositories/IUserTypeRepository';
import { UserType } from '@/src/core/domain/entities/UserType';

export class SupabaseUserTypeRepository implements IUserTypeRepository {
  
  async findAll(): Promise<UserType[]> {
    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('tipos_usuarios')
      .select('*')
      .order('id_tipo_usuario', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener tipos de usuario: ${error.message}`);
    }

    return (data || []).map(row => UserType.fromDatabase(row));
  }

  async findById(id: number): Promise<UserType | null> {
    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('tipos_usuarios')
      .select('*')
      .eq('id_tipo_usuario', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener tipo de usuario: ${error.message}`);
    }

    return data ? UserType.fromDatabase(data) : null;
  }

  async create(data: { nombre: string; descripcion: string | null }): Promise<UserType> {
    const { data: created, error } = await supabaseAdmin
      .schema('app')
      .from('tipos_usuarios')
      .insert({
        nombre: data.nombre,
        descripcion: data.descripcion
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear tipo de usuario: ${error.message}`);
    }

    return UserType.fromDatabase(created);
  }

  async update(
    id: number,
    data: { nombre: string; descripcion: string | null }
  ): Promise<UserType> {
    const { data: updated, error } = await supabaseAdmin
      .schema('app')
      .from('tipos_usuarios')
      .update({
        nombre: data.nombre,
        descripcion: data.descripcion,
        updated_at: new Date().toISOString()
      })
      .eq('id_tipo_usuario', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar tipo de usuario: ${error.message}`);
    }

    return UserType.fromDatabase(updated);
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabaseAdmin
      .schema('app')
      .from('tipos_usuarios')
      .delete()
      .eq('id_tipo_usuario', id);

    if (error) {
      throw new Error(`Error al eliminar tipo de usuario: ${error.message}`);
    }
  }

  async existsByName(nombre: string, excludeId?: number): Promise<boolean> {
    let query = supabaseAdmin
      .schema('app')
      .from('tipos_usuarios')
      .select('id_tipo_usuario', { count: 'exact', head: true })
      .ilike('nombre', nombre);

    if (excludeId) {
      query = query.neq('id_tipo_usuario', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Error al verificar nombre: ${error.message}`);
    }

    return (count || 0) > 0;
  }
}
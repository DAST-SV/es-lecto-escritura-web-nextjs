// ============================================
// src/infrastructure/repositories/user-types/UserTypeRepository.ts
// ✅ CON SOFT DELETE Y RESTORE
// ============================================

import { IUserTypeRepository } from '@/src/core/domain/repositories/IUserTypeRepository';
import { UserType } from '@/src/core/domain/entities/UserType';
import { supabaseAdmin } from '../../config/supabase.config';

export class SupabaseUserTypeRepository implements IUserTypeRepository {
  
  async findAll(): Promise<UserType[]> {
    console.log('🔍 Listando tipos de usuario (incluyendo eliminados)');

    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('user_types')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener tipos de usuario:', error);
      throw new Error(`Error al obtener tipos de usuario: ${error.message}`);
    }

    console.log(`✅ ${data?.length || 0} tipos de usuario encontrados`);
    return (data || []).map(row => UserType.fromDatabase(row));
  }

  async findById(id: number): Promise<UserType | null> {
    console.log('🔍 Buscando tipo de usuario:', id);

    const { data, error } = await supabaseAdmin
      .schema('app')
      .from('user_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('⚠️ Tipo de usuario no encontrado:', id);
        return null;
      }
      console.error('❌ Error al obtener tipo de usuario:', error);
      throw new Error(`Error al obtener tipo de usuario: ${error.message}`);
    }

    console.log('✅ Tipo de usuario encontrado:', data);
    return data ? UserType.fromDatabase(data) : null;
  }

  async create(data: { name: string; description: string | null }): Promise<UserType> {
    console.log('📝 Creando tipo de usuario:', data);

    const { data: created, error } = await supabaseAdmin
      .schema('app')
      .from('user_types')
      .insert({
        name: data.name,
        description: data.description,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear tipo de usuario:', error);
      throw new Error(`Error al crear tipo de usuario: ${error.message}`);
    }

    console.log('✅ Tipo de usuario creado:', created);
    return UserType.fromDatabase(created);
  }

  async update(
    id: number,
    data: { name: string; description: string | null }
  ): Promise<UserType> {
    console.log('📝 Actualizando tipo de usuario:', id, data);

    const { data: updated, error } = await supabaseAdmin
      .schema('app')
      .from('user_types')
      .update({
        name: data.name,
        description: data.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al actualizar tipo de usuario:', error);
      throw new Error(`Error al actualizar tipo de usuario: ${error.message}`);
    }

    console.log('✅ Tipo de usuario actualizado:', updated);
    return UserType.fromDatabase(updated);
  }

  async delete(id: number): Promise<void> {
    console.log('🗑️ Eliminando tipo de usuario (soft delete):', id);

    const { error } = await supabaseAdmin
      .schema('app')
      .from('user_types')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar tipo de usuario:', error);
      throw new Error(`Error al eliminar tipo de usuario: ${error.message}`);
    }

    console.log('✅ Tipo de usuario eliminado (soft delete)');
  }

  async restore(id: number): Promise<UserType> {
    console.log('♻️ Restaurando tipo de usuario:', id);

    const { data: restored, error } = await supabaseAdmin
      .schema('app')
      .from('user_types')
      .update({
        is_active: true,
        deleted_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al restaurar tipo de usuario:', error);
      throw new Error(`Error al restaurar tipo de usuario: ${error.message}`);
    }

    console.log('✅ Tipo de usuario restaurado:', restored);
    return UserType.fromDatabase(restored);
  }

  async hardDelete(id: number): Promise<void> {
    console.log('🗑️ Eliminando tipo de usuario PERMANENTEMENTE:', id);

    const { error } = await supabaseAdmin
      .schema('app')
      .from('user_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error al eliminar permanentemente:', error);
      throw new Error(`Error al eliminar permanentemente: ${error.message}`);
    }

    console.log('✅ Tipo de usuario eliminado permanentemente');
  }

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    console.log('🔍 Verificando nombre de tipo de usuario:', name);

    let query = supabaseAdmin
      .schema('app')
      .from('user_types')
      .select('id', { count: 'exact', head: true })
      .ilike('name', name)
      .is('deleted_at', null);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      console.error('❌ Error al verificar nombre:', error);
      throw new Error(`Error al verificar nombre: ${error.message}`);
    }

    const exists = (count || 0) > 0;
    console.log(`${exists ? '❌' : '✅'} Nombre ${exists ? 'ya existe' : 'disponible'}`);
    return exists;
  }
}
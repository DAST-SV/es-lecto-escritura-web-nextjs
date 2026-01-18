// app/[locale]/admin/roles/page.tsx
// ✅ MÓDULO 3: Gestión de Roles

'use client';

import { useState, useEffect } from 'react';
import { RouteGuard } from '@/src/presentation/components/RouteGuard';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  hierarchy_level: number;
  is_active: boolean;
  is_system_role: boolean;
  created_at: string;
}

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    hierarchy_level: 10,
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data } = await supabase
      .schema('app')
      .from('roles')
      .select('*')
      .order('hierarchy_level', { ascending: false });

    setRoles(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    if (editingRole) {
      // Actualizar
      const { error } = await supabase
        .schema('app')
        .from('roles')
        .update({
          display_name: formData.display_name,
          description: formData.description || null,
          hierarchy_level: formData.hierarchy_level,
        })
        .eq('id', editingRole.id);

      if (error) {
        alert('Error al actualizar rol: ' + error.message);
      } else {
        alert('Rol actualizado exitosamente');
        resetForm();
        loadRoles();
      }
    } else {
      // Crear
      const { error } = await supabase
        .schema('app')
        .from('roles')
        .insert([{
          name: formData.name.toLowerCase().replace(/\s+/g, '_'),
          display_name: formData.display_name,
          description: formData.description || null,
          hierarchy_level: formData.hierarchy_level,
          is_active: true,
          is_system_role: false,
        }]);

      if (error) {
        alert('Error al crear rol: ' + error.message);
      } else {
        alert('Rol creado exitosamente');
        resetForm();
        loadRoles();
      }
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      hierarchy_level: role.hierarchy_level,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (role: Role) => {
    if (role.is_system_role) {
      alert('No puedes desactivar roles del sistema');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .schema('app')
      .from('roles')
      .update({ is_active: !role.is_active })
      .eq('id', role.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      loadRoles();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      hierarchy_level: 10,
    });
    setEditingRole(null);
    setShowForm(false);
  };

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👥 Módulo 3: Gestión de Roles
            </h1>
            <p className="text-gray-600">
              Crear, editar y gestionar roles del sistema
            </p>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              {showForm ? '❌ Cancelar' : '➕ Nuevo Rol'}
            </button>
          </div>

          {/* Formulario */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre técnico * (slug)
                    </label>
                    <input
                      type="text"
                      required
                      disabled={!!editingRole}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="teacher"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Solo minúsculas y guiones bajos
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre visible *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="Profesor"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nivel jerárquico *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="99"
                      value={formData.hierarchy_level}
                      onChange={(e) => setFormData({ ...formData, hierarchy_level: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mayor = más permisos (super_admin = 100)
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe las responsabilidades de este rol..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    {editingRole ? '💾 Guardar Cambios' : '➕ Crear Rol'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Roles */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Roles del Sistema ({roles.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Cargando...</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {roles.map((role) => (
                  <div key={role.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {role.display_name}
                          </h3>
                          <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {role.name}
                          </code>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Nivel {role.hierarchy_level}
                          </span>
                          {role.is_system_role && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              🔒 Sistema
                            </span>
                          )}
                          {!role.is_active && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              ⏸️ Inactivo
                            </span>
                          )}
                        </div>
                        
                        {role.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {role.description}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500">
                          Creado: {new Date(role.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {!role.is_system_role && (
                          <>
                            <button
                              onClick={() => handleEdit(role)}
                              className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleToggleActive(role)}
                              className={`text-sm px-4 py-2 rounded ${
                                role.is_active
                                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {role.is_active ? '⏸️ Desactivar' : '▶️ Activar'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ayuda */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              ℹ️ Información sobre Roles
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• <strong>Nivel jerárquico:</strong> Determina el orden de importancia (mayor = más permisos)</li>
              <li>• <strong>Roles de sistema:</strong> No pueden ser editados ni eliminados (super_admin, guest, etc)</li>
              <li>• <strong>Desactivar:</strong> Impide que se asignen nuevos usuarios, pero mantiene los existentes</li>
            </ul>
          </div>

        </div>
      </div>
    </RouteGuard>
  );
}
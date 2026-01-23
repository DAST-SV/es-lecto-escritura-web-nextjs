// ============================================
// app/[locale]/admin/role-permissions/page.tsx
// Admin Page: Route Permissions
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { RouteGuard } from '@/src/presentation/features/permissions/components';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { useRoutePermissions } from '@/src/presentation/features/route-permissions/hooks/useRoutePermissions';
import { useRoles } from '@/src/presentation/features/roles/hooks/useRoles';
import { PermissionsList, CreatePermissionForm } from '@/src/presentation/features/route-permissions/components';
import { RoutePermission } from '@/src/core/domain/entities/RoutePermission';
import { CreateRoutePermissionDTO } from '@/src/core/domain/repositories/IRoutePermissionRepository';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { Shield, Route, Globe } from 'lucide-react';

export default function RoutePermissionsPage() {
  const { t } = useSupabaseTranslations('route_permissions');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { permissions, loading, error, createPermission, deletePermission, refresh } = useRoutePermissions();
  const { roles } = useRoles();
  const [showForm, setShowForm] = useState(false);
  const [routes, setRoutes] = useState<Array<{ id: string; path: string; name?: string }>>([]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const loadRoutes = async () => {
      const supabase = createClient();
      const { data } = await supabase.schema('app').from('routes').select('id, path, name').order('path');
      if (data) setRoutes(data);
    };
    loadRoutes();
  }, []);

  const handleCreate = async (data: CreateRoutePermissionDTO) => {
    try {
      await createPermission(data);
      setShowForm(false);
      alert('Permission created successfully!');
    } catch (err: any) {
      throw err;
    }
  };

  const handleDelete = async (permission: RoutePermission) => {
    if (!confirm(`Delete permission for ${permission.roleDisplayName} on ${permission.routePath}?`)) return;
    try {
      await deletePermission(permission.id);
      alert('Permission deleted successfully!');
    } catch (err: any) {
      alert(err.message || 'Error deleting permission');
    }
  };

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Route Permissions</h1>
                <p className="text-slate-600 mt-1">Manage role-based access to routes</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl border-2 bg-green-50 border-green-200 text-green-700">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">Total Permissions</p>
                  <p className="text-3xl font-bold mt-1">{permissions.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-200 text-blue-700">
              <div className="flex items-center gap-3">
                <Route className="w-6 h-6 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">Protected Routes</p>
                  <p className="text-3xl font-bold mt-1">{new Set(permissions.map(p => p.routeId)).size}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border-2 bg-purple-50 border-purple-200 text-purple-700">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">Global Permissions</p>
                  <p className="text-3xl font-bold mt-1">{permissions.filter(p => p.appliesToAllLanguages()).length}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
              <button onClick={refresh} className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold">Try again</button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : showForm ? (
            <div className="max-w-2xl mx-auto">
              <CreatePermissionForm roles={roles} routes={routes} currentUserId={currentUserId} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
            </div>
          ) : (
            <PermissionsList permissions={permissions} loading={loading} onOpenCreate={() => setShowForm(true)} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </RouteGuard>
  );
}

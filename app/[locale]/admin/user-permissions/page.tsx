// ============================================
// app/[locale]/admin/user-permissions/page.tsx
// Admin Page: User Route Permissions
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { RouteGuard } from '@/src/presentation/features/permissions/components';
import { useUserRoutePermissions } from '@/src/presentation/features/user-route-permissions/hooks/useUserRoutePermissions';
import { UserPermissionsList, CreateUserPermissionForm } from '@/src/presentation/features/user-route-permissions/components';
import { UserRoutePermission } from '@/src/core/domain/entities/UserRoutePermission';
import { CreateUserRoutePermissionDTO } from '@/src/core/domain/repositories/IUserRoutePermissionRepository';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

export default function UserPermissionsPage() {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { permissions, loading, error, createPermission, deletePermission, refresh } = useUserRoutePermissions();
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [routes, setRoutes] = useState<Array<{ id: string; path: string }>>([]);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data: usersData } = await supabase.auth.admin.listUsers();
      if (usersData?.users) setUsers(usersData.users.map(u => ({ id: u.id, email: u.email || u.id })));

      const { data: routesData } = await supabase.schema('app').from('routes').select('id, path');
      if (routesData) setRoutes(routesData);
    };
    init();
  }, []);

  const handleCreate = async (data: CreateUserRoutePermissionDTO) => {
    try {
      await createPermission(data);
      setShowForm(false);
      alert('Permission created successfully!');
    } catch (err: any) {
      throw err;
    }
  };

  const handleDelete = async (permission: UserRoutePermission) => {
    if (!confirm(\`Delete permission for \${permission.getUserDisplay()}?\`)) return;
    try {
      await deletePermission(permission.id);
      alert('Permission deleted!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const grants = permissions.filter(p => p.isGrant());
  const denies = permissions.filter(p => p.isDeny());

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">User Route Permissions</h1>
                <p className="text-slate-600 mt-1">Individual GRANT/DENY permissions for users</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl border-2 bg-purple-50 border-purple-200 text-purple-700">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <div>
                  <p className="text-sm font-medium opacity-80">Total</p>
                  <p className="text-3xl font-bold">{permissions.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border-2 bg-green-50 border-green-200 text-green-700">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <p className="text-sm font-medium opacity-80">GRANT</p>
                  <p className="text-3xl font-bold">{grants.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border-2 bg-red-50 border-red-200 text-red-700">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6" />
                <div>
                  <p className="text-sm font-medium opacity-80">DENY</p>
                  <p className="text-3xl font-bold">{denies.length}</p>
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
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : showForm ? (
            <div className="max-w-2xl mx-auto">
              <CreateUserPermissionForm users={users} routes={routes} currentUserId={currentUserId} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
            </div>
          ) : (
            <UserPermissionsList permissions={permissions} loading={loading} onOpenCreate={() => setShowForm(true)} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </RouteGuard>
  );
}

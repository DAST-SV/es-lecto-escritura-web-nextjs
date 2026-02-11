// ============================================
// app/[locale]/admin/user-roles/page.tsx
// Admin Page: User-Role Assignments
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { RouteGuard } from '@/src/presentation/features/permissions/components';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { useUserRoles } from '@/src/presentation/features/user-roles/hooks/useUserRoles';
import { useRoles } from '@/src/presentation/features/roles/hooks/useRoles';
import { UserRolesList, AssignRoleForm } from '@/src/presentation/features/user-roles/components';
import { UserRole } from '@/src/core/domain/entities/UserRole';
import { AssignRoleDTO, RevokeRoleDTO } from '@/src/core/domain/repositories/IUserRoleRepository';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { Users, Shield, CheckCircle } from 'lucide-react';

export default function UserRolesPage() {
  const { t, loading: translationsLoading } = useSupabaseTranslations('user_roles');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { userRoles, loading, error, assignRole, revokeRole, deleteUserRole, refresh } = useUserRoles();
  const { roles } = useRoles();
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.admin.listUsers();
      if (data?.users) {
        setUsers(data.users.map((u: any) => ({ id: u.id, email: u.email || u.id })));
      }
    };
    loadUsers();
  }, []);

  const handleAssign = async (data: AssignRoleDTO) => {
    try {
      await assignRole(data);
      setShowForm(false);
      alert(t('page.success.assigned') || 'Role assigned successfully!');
    } catch (err: any) {
      throw err;
    }
  };

  const handleRevoke = async (userRole: UserRole) => {
    if (!confirm(t('page.confirm.revoke') || `Revoke ${userRole.getRoleDisplay()} from ${userRole.getUserDisplay()}?`)) return;
    try {
      await revokeRole(userRole.id, { revokedBy: currentUserId });
      alert(t('page.success.revoked') || 'Role revoked successfully!');
    } catch (err: any) {
      alert(err.message || t('page.error.revoke') || 'Error revoking role');
    }
  };

  const handleDelete = async (userRole: UserRole) => {
    if (!confirm(t('page.confirm.delete') || 'Permanently delete this assignment?')) return;
    try {
      await deleteUserRole(userRole.id);
      alert(t('page.success.deleted') || 'Assignment deleted successfully!');
    } catch (err: any) {
      alert(err.message || t('page.error.delete') || 'Error deleting assignment');
    }
  };

  const activeAssignments = userRoles.filter(ur => ur.isAssignmentActive());
  const revokedAssignments = userRoles.filter(ur => ur.isRevoked());

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{t('page.title') || 'User Role Assignments'}</h1>
                <p className="text-slate-600 mt-1">{t('page.description') || 'Manage role assignments for users'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-200 text-blue-700">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">{t('stats.total') || 'Total Assignments'}</p>
                  <p className="text-3xl font-bold mt-1">{userRoles.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border-2 bg-green-50 border-green-200 text-green-700">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">{t('stats.active') || 'Active'}</p>
                  <p className="text-3xl font-bold mt-1">{activeAssignments.length}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border-2 bg-amber-50 border-amber-200 text-amber-700">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">{t('stats.revoked') || 'Revoked'}</p>
                  <p className="text-3xl font-bold mt-1">{revokedAssignments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
              <button onClick={refresh} className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold">{t('page.retry') || 'Try again'}</button>
            </div>
          )}

          {loading || translationsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : showForm ? (
            <div className="max-w-2xl mx-auto">
              <AssignRoleForm users={users} roles={roles} currentUserId={currentUserId} onSubmit={handleAssign} onCancel={() => setShowForm(false)} />
            </div>
          ) : (
            <UserRolesList userRoles={userRoles} loading={loading} onOpenAssign={() => setShowForm(true)} onRevoke={handleRevoke} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </RouteGuard>
  );
}

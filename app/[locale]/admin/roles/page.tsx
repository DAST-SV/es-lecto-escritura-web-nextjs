// ============================================
// app/[locale]/admin/roles/page.tsx
// Admin Page: Role Management
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { RouteGuard } from '@/src/presentation/features/permissions/components';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { useRoles } from '@/src/presentation/features/roles/hooks/useRoles';
import { RolesList, RoleForm } from '@/src/presentation/features/roles/components';
import { Role } from '@/src/core/domain/entities/Role';
import { CreateRoleDTO, UpdateRoleDTO } from '@/src/core/domain/repositories/IRoleRepository';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { Shield, Users, Lock } from 'lucide-react';

export default function RolesPage() {
  const { t, loading: translationsLoading } = useSupabaseTranslations('roles');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { roles, loading, error, createRole, updateRole, deleteRole, deactivateRole, activateRole, refresh } = useRoles();
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const handleCreate = async (data: CreateRoleDTO | UpdateRoleDTO) => {
    try {
      await createRole(data as CreateRoleDTO);
      setShowForm(false);
      alert(t('page.success.created') || 'Role created successfully!');
    } catch (err: any) {
      throw err; // Re-throw to let form handle the error
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  const handleUpdate = async (data: CreateRoleDTO | UpdateRoleDTO) => {
    if (!editingRole) return;

    try {
      await updateRole(editingRole.id, data as UpdateRoleDTO, currentUserId);
      setShowForm(false);
      setEditingRole(null);
      alert(t('page.success.updated') || 'Role updated successfully!');
    } catch (err: any) {
      throw err; // Re-throw to let form handle the error
    }
  };

  const handleDelete = async (role: Role) => {
    const confirmMessage = t('page.confirm.delete') || `Are you sure you want to delete the role "${role.displayName}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      await deleteRole(role.id);
      alert(t('page.success.deleted') || 'Role deleted successfully!');
    } catch (err: any) {
      alert(err.message || t('page.error.delete') || 'Error deleting role');
    }
  };

  const handleToggleActive = async (role: Role) => {
    try {
      if (role.isActive) {
        await deactivateRole(role.id);
        alert(t('page.success.deactivated') || 'Role deactivated successfully!');
      } else {
        await activateRole(role.id);
        alert(t('page.success.activated') || 'Role activated successfully!');
      }
    } catch (err: any) {
      alert(err.message || t('page.error.toggle') || 'Error toggling role status');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRole(null);
  };

  const systemRoles = roles.filter(r => r.isSystemRole);
  const customRoles = roles.filter(r => !r.isSystemRole);
  const activeRoles = roles.filter(r => r.isActive);

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {t('page.title') || 'Role Management'}
                </h1>
                <p className="text-slate-600 mt-1">
                  {t('page.description') || 'Manage system and custom roles with hierarchy levels'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              label={t('stats.total_roles') || 'Total Roles'}
              value={roles.length}
              color="blue"
            />
            <StatCard
              icon={<Lock className="w-6 h-6" />}
              label={t('stats.system_roles') || 'System Roles'}
              value={systemRoles.length}
              color="purple"
            />
            <StatCard
              icon={<Shield className="w-6 h-6" />}
              label={t('stats.custom_roles') || 'Custom Roles'}
              value={customRoles.length}
              color="indigo"
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={refresh}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold"
              >
                {t('page.retry') || 'Try again'}
              </button>
            </div>
          )}

          {/* Form or List */}
          {loading || translationsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">
                  {t('page.loading') || 'Loading roles...'}
                </p>
              </div>
            </div>
          ) : showForm ? (
            <div className="max-w-3xl mx-auto">
              <RoleForm
                role={editingRole || undefined}
                userId={currentUserId}
                onSubmit={editingRole ? handleUpdate : handleCreate}
                onCancel={handleCloseForm}
                isCreate={!editingRole}
              />
            </div>
          ) : (
            <RolesList
              roles={roles}
              loading={loading}
              onOpenCreate={() => setShowForm(true)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          )}

          {/* Info Card */}
          {!showForm && (
            <div className="mt-8 bg-white rounded-xl border-2 border-indigo-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-indigo-600">ℹ️</span>
                {t('page.info.title') || 'About Roles'}
              </h3>
              <ul className="space-y-2 text-slate-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{t('page.info.1') || 'Roles define user permissions and access levels across the system'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{t('page.info.2') || 'System roles are protected and cannot be deleted'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{t('page.info.3') || 'Hierarchy levels determine which roles can manage others (higher = more authority)'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{t('page.info.4') || 'Custom roles can be created, modified, and deleted as needed'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{t('page.info.5') || 'Inactive roles are hidden from assignment but preserved in the system'}</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'purple' | 'indigo';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3">
        <div className="opacity-80">{icon}</div>
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

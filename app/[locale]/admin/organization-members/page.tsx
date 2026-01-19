// ============================================
// app/[locale]/admin/organization-members/page.tsx
// Admin page for managing organization members
// ============================================

'use client';

import React, { useState } from 'react';
import { RouteGuard } from '@/src/presentation/features/permissions/components';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { useOrganizationMembers } from '@/src/presentation/features/organization-members/hooks/useOrganizationMembers';
import { OrganizationMembersList, AddMemberModal } from '@/src/presentation/features/organization-members/components';
import { OrganizationMember, OrganizationMemberRole } from '@/src/core/domain/entities/OrganizationMember';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { Users, Loader2 } from 'lucide-react';

export default function OrganizationMembersPage() {
  const { t, loading: translationsLoading } = useSupabaseTranslations('organization_members');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { members, loading, error, addMember, updateMemberRole, removeMember, refresh } = useOrganizationMembers();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);

  // Get current user
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const handleAddMember = async (
    organizationId: string,
    userId: string,
    role: OrganizationMemberRole,
    invitedBy: string
  ) => {
    try {
      await addMember({
        organizationId,
        userId,
        role,
        invitedBy
      });
      setShowAddModal(false);
      alert(t('member_added_success') || 'Member added successfully!');
    } catch (err: any) {
      throw err; // Re-throw to let modal handle the error
    }
  };

  const handleEditRole = async (member: OrganizationMember) => {
    const newRoleInput = prompt(
      t('edit_role_prompt') || 'Enter new role (owner, admin, member, guest):',
      member.role
    );

    if (!newRoleInput) return;

    const newRole = newRoleInput.toLowerCase() as OrganizationMemberRole;
    const validRoles: OrganizationMemberRole[] = ['owner', 'admin', 'member', 'guest'];

    if (!validRoles.includes(newRole)) {
      alert(t('invalid_role') || 'Invalid role. Must be: owner, admin, member, or guest');
      return;
    }

    try {
      await updateMemberRole(member.id, newRole, currentUserId);
      alert(t('role_updated_success') || 'Role updated successfully!');
    } catch (err: any) {
      alert(err.message || t('role_update_error') || 'Error updating role');
    }
  };

  const handleRemoveMember = async (member: OrganizationMember) => {
    const confirmMessage = member.userId === currentUserId
      ? t('confirm_leave') || 'Are you sure you want to leave this organization?'
      : t('confirm_remove') || `Are you sure you want to remove ${member.userName}?`;

    if (!confirm(confirmMessage)) return;

    try {
      await removeMember(member.id, currentUserId);
      alert(t('member_removed_success') || 'Member removed successfully!');
    } catch (err: any) {
      alert(err.message || t('member_remove_error') || 'Error removing member');
    }
  };

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {t('page_title') || 'Organization Members'}
                </h1>
                <p className="text-slate-600 mt-1">
                  {t('page_description') || 'Manage members across all organizations'}
                </p>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
              <button
                onClick={refresh}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold"
              >
                {t('retry') || 'Try again'}
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading || translationsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  {t('loading') || 'Loading members...'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Members List */}
              <OrganizationMembersList
                members={members}
                currentUserId={currentUserId}
                onOpenAdd={() => setShowAddModal(true)}
                onEditRole={handleEditRole}
                onRemove={handleRemoveMember}
              />

              {/* Stats Card */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  label={t('total_members') || 'Total Members'}
                  value={members.length}
                  color="blue"
                />
                <StatCard
                  label={t('owners') || 'Owners'}
                  value={members.filter(m => m.role === 'owner').length}
                  color="purple"
                />
                <StatCard
                  label={t('admins') || 'Admins'}
                  value={members.filter(m => m.role === 'admin').length}
                  color="indigo"
                />
                <StatCard
                  label={t('active_members') || 'Active'}
                  value={members.filter(m => m.isActive).length}
                  color="green"
                />
              </div>
            </>
          )}

          {/* Add Member Modal */}
          <AddMemberModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddMember}
            currentUserId={currentUserId}
          />

          {/* Info Card */}
          <div className="mt-8 bg-white rounded-xl border-2 border-blue-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-blue-600">ℹ️</span>
              {t('info_title') || 'About Organization Members'}
            </h3>
            <ul className="space-y-2 text-slate-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>{t('info_1') || 'Members can be assigned different roles with varying permissions'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>{t('info_2') || 'Only admins and owners can add or remove members'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>{t('info_3') || 'Each organization must have at least one owner'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>{t('info_4') || 'Removed members are soft-deleted and can be restored if needed'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  label: string;
  value: number;
  color: 'blue' | 'purple' | 'indigo' | 'green';
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 border-blue-200 text-blue-700',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 border-purple-200 text-purple-700',
    indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 border-indigo-200 text-indigo-700',
    green: 'from-green-500 to-green-600 bg-green-50 border-green-200 text-green-700',
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colorClasses[color].split(' ').slice(2).join(' ')}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

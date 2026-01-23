// ============================================
// src/presentation/features/organization-members/components/OrganizationMembersList.tsx
// Component for displaying and managing organization members
// ============================================

'use client';

import React, { useState } from 'react';
import { Search, Users, Plus, Edit2, Trash2, Shield, Mail } from 'lucide-react';
import { OrganizationMember, OrganizationMemberRole } from '@/src/core/domain/entities/OrganizationMember';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

interface OrganizationMembersListProps {
  members: OrganizationMember[];
  currentUserId: string;
  onOpenAdd: () => void;
  onEditRole: (member: OrganizationMember) => void;
  onRemove: (member: OrganizationMember) => void;
}

const roleLabels: Record<OrganizationMemberRole, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  member: 'Miembro',
  guest: 'Invitado',
};

const roleColors: Record<OrganizationMemberRole, string> = {
  owner: 'bg-purple-100 text-purple-700 border-purple-200',
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  member: 'bg-green-100 text-green-700 border-green-200',
  guest: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function OrganizationMembersList({
  members,
  currentUserId,
  onOpenAdd,
  onEditRole,
  onRemove,
}: OrganizationMembersListProps) {
  const { t } = useSupabaseTranslations('organization_members');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<OrganizationMemberRole | 'all'>('all');

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.organizationName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || member.role === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1">
            <Users className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">
              {t('title') || 'Organization Members'}
            </h1>
            <span className="text-sm text-slate-500">
              ({members.length} {members.length === 1 ? 'member' : 'members'})
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('search_placeholder') || 'Search by name or email...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-blue-200 bg-white focus:outline-none focus:border-blue-400 text-sm min-w-[200px]"
              />
            </div>

            {/* Filter by Role */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as OrganizationMemberRole | 'all')}
              className="px-4 py-2 rounded-lg border border-blue-200 bg-white text-sm font-medium text-blue-700 focus:outline-none focus:border-blue-400"
            >
              <option value="all">{t('all_roles') || 'All Roles'}</option>
              {Object.entries(roleLabels).map(([role, label]) => (
                <option key={role} value={role}>{label}</option>
              ))}
            </select>

            {/* Add Member Button */}
            <button
              onClick={onOpenAdd}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('add_member') || 'Add Member'}
            </button>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="flex-1 overflow-auto">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-400">
              {searchTerm || filterRole !== 'all'
                ? t('no_members_found') || 'No members found'
                : t('no_members') || 'No members yet'}
            </p>
            {!searchTerm && filterRole === 'all' && (
              <button
                onClick={onOpenAdd}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('add_first_member') || 'Add your first member'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('member') || 'Member'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('email') || 'Email'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('role') || 'Role'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('organization') || 'Organization'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('joined_date') || 'Joined'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('status') || 'Status'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('actions') || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    currentUserId={currentUserId}
                    onEditRole={() => onEditRole(member)}
                    onRemove={() => onRemove(member)}
                    t={t}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Member Row Component
// ============================================

interface MemberRowProps {
  member: OrganizationMember;
  currentUserId: string;
  onEditRole: () => void;
  onRemove: () => void;
  t: (key: string) => string;
}

function MemberRow({ member, currentUserId, onEditRole, onRemove, t }: MemberRowProps) {
  const isCurrentUser = member.userId === currentUserId;

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      {/* Member Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-semibold">
            {member.userName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-medium text-slate-900 flex items-center gap-2">
              {member.userName || 'Unknown User'}
              {isCurrentUser && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {t('you') || 'You'}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Mail className="w-4 h-4" />
          {member.userEmail || 'N/A'}
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${roleColors[member.role]}`}>
          {member.isOwner() && <Shield className="w-3 h-3" />}
          {roleLabels[member.role]}
        </span>
      </td>

      {/* Organization */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-900">
          {member.organizationName || 'N/A'}
        </div>
      </td>

      {/* Joined Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
        {member.joinedAt.toLocaleDateString()}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
          member.isActive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {member.isActive ? t('active') || 'Active' : t('inactive') || 'Inactive'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEditRole}
            className="p-2 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 transition-colors"
            title={t('edit_role') || 'Edit Role'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
            title={t('remove_member') || 'Remove Member'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

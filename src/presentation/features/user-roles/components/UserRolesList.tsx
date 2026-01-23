// ============================================
// src/presentation/features/user-roles/components/UserRolesList.tsx
// Component: UserRoles List
// ============================================

'use client';

import React, { useState, useMemo } from 'react';
import { UserRole } from '@/src/core/domain/entities/UserRole';
import { UserRoleCard } from './UserRoleCard';
import { Search, Plus } from 'lucide-react';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

interface UserRolesListProps {
  userRoles: UserRole[];
  loading?: boolean;
  onOpenAssign?: () => void;
  onRevoke?: (userRole: UserRole) => void;
  onDelete?: (userRole: UserRole) => void;
}

export function UserRolesList({ userRoles, loading, onOpenAssign, onRevoke, onDelete }: UserRolesListProps) {
  const { t } = useSupabaseTranslations('user_roles');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUserRoles = useMemo(() => {
    return userRoles.filter((ur) =>
      ur.getUserDisplay().toLowerCase().includes(searchTerm.toLowerCase()) ||
      ur.getRoleDisplay().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ur.userEmail && ur.userEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [userRoles, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t('list.title') || 'User Roles'} ({filteredUserRoles.length})</h2>
        {onOpenAssign && (
          <button onClick={onOpenAssign} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" /> {t('list.button.assign') || 'Assign Role'}
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('list.search.placeholder') || 'Search by user or role...'}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500"
        />
      </div>

      {filteredUserRoles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600">{searchTerm ? (t('list.empty.filtered') || 'No user roles match your search') : (t('list.empty.no_roles') || 'No user roles assigned yet')}</p>
          {onOpenAssign && !searchTerm && (
            <button onClick={onOpenAssign} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
              {t('list.button.assign_first') || 'Assign First Role'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUserRoles.map((userRole) => (
            <UserRoleCard key={userRole.id} userRole={userRole} onRevoke={onRevoke} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

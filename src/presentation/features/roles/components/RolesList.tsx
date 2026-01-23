// ============================================
// src/presentation/features/roles/components/RolesList.tsx
// Component: Roles List
// ============================================

'use client';

import React, { useState, useMemo } from 'react';
import { Role } from '@/src/core/domain/entities/Role';
import { RoleCard } from './RoleCard';
import { Search, Plus, Filter } from 'lucide-react';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

interface RolesListProps {
  roles: Role[];
  loading?: boolean;
  onOpenCreate?: () => void;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
  onToggleActive?: (role: Role) => void;
}

export function RolesList({
  roles,
  loading = false,
  onOpenCreate,
  onEdit,
  onDelete,
  onToggleActive,
}: RolesListProps) {
  const { t, loading: translationsLoading } = useSupabaseTranslations('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Filtered and searched roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      // Search filter
      const matchesSearch =
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Type filter
      const matchesType =
        filterType === 'all' ||
        (filterType === 'system' && role.isSystemRole) ||
        (filterType === 'custom' && !role.isSystemRole);

      // Status filter
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && role.isActive) ||
        (filterStatus === 'inactive' && !role.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [roles, searchTerm, filterType, filterStatus]);

  if (loading || translationsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {t('list.loading') || 'Loading roles...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('list.title') || 'Roles'} ({filteredRoles.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('list.subtitle') || 'Manage system and custom roles'}
          </p>
        </div>

        {onOpenCreate && (
          <button
            onClick={onOpenCreate}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            {t('list.button.create') || 'Create Role'}
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('list.search.placeholder') || 'Search by name, display name, or description...'}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {t('list.filters.label') || 'Filters:'}
            </span>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-1.5 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          >
            <option value="all">{t('list.filters.type.all') || 'All Types'}</option>
            <option value="system">{t('list.filters.type.system') || 'System Roles'}</option>
            <option value="custom">{t('list.filters.type.custom') || 'Custom Roles'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 border-2 border-gray-300 rounded-lg text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          >
            <option value="all">{t('list.filters.status.all') || 'All Status'}</option>
            <option value="active">{t('list.filters.status.active') || 'Active'}</option>
            <option value="inactive">{t('list.filters.status.inactive') || 'Inactive'}</option>
          </select>

          {/* Reset Filters */}
          {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterStatus('all');
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              {t('list.filters.reset') || 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Roles Grid */}
      {filteredRoles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600 font-medium">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? (t('list.empty.filtered') || 'No roles match your filters')
              : (t('list.empty.no_roles') || 'No roles yet')
            }
          </p>
          {onOpenCreate && !searchTerm && (
            <button
              onClick={onOpenCreate}
              className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              {t('list.button.create_first') || 'Create First Role'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}

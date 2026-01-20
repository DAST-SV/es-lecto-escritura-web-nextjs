// ============================================
// src/presentation/features/roles/components/RoleForm.tsx
// Component: Role Form (Create/Edit)
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { Role } from '@/src/core/domain/entities/Role';
import { CreateRoleDTO, UpdateRoleDTO } from '@/src/core/domain/repositories/IRoleRepository';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

interface RoleFormProps {
  role?: Role;
  userId: string;
  onSubmit: (data: CreateRoleDTO | UpdateRoleDTO) => Promise<void>;
  onCancel: () => void;
  isCreate?: boolean;
}

export function RoleForm({ role, userId, onSubmit, onCancel, isCreate = true }: RoleFormProps) {
  const { t, loading: translationsLoading } = useSupabaseTranslations('roles');

  const [name, setName] = useState(role?.name || '');
  const [displayName, setDisplayName] = useState(role?.displayName || '');
  const [description, setDescription] = useState(role?.description || '');
  const [hierarchyLevel, setHierarchyLevel] = useState(role?.hierarchyLevel || 0);
  const [isActive, setIsActive] = useState(role?.isActive ?? true);
  const [isSystemRole, setIsSystemRole] = useState(role?.isSystemRole ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError(t('form.error.name_required') || 'Role name is required');
      return;
    }

    if (!displayName.trim()) {
      setError(t('form.error.display_name_required') || 'Display name is required');
      return;
    }

    if (name !== name.toLowerCase()) {
      setError(t('form.error.name_lowercase') || 'Role name must be lowercase');
      return;
    }

    try {
      setSubmitting(true);

      if (isCreate) {
        const dto: CreateRoleDTO = {
          name: name.trim().toLowerCase(),
          displayName: displayName.trim(),
          description: description.trim() || undefined,
          hierarchyLevel,
          isActive,
          isSystemRole,
          createdBy: userId,
        };
        await onSubmit(dto);
      } else {
        const dto: UpdateRoleDTO = {
          displayName: displayName.trim(),
          description: description.trim() || undefined,
          hierarchyLevel,
          isActive,
        };
        await onSubmit(dto);
      }
    } catch (err: any) {
      setError(err.message || t('form.error.submit_failed') || 'Failed to submit form');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isCreate
          ? (t('form.title.create') || 'Create New Role')
          : (t('form.title.edit') || 'Edit Role')
        }
      </h2>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Name (only for create) */}
      {isCreate && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('form.label.name') || 'Role Name'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase())}
            placeholder="admin"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-mono"
            required
            disabled={submitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('form.help.name') || 'Lowercase letters only, used internally'}
          </p>
        </div>
      )}

      {/* Display Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('form.label.display_name') || 'Display Name'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Administrator"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          required
          disabled={submitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('form.help.display_name') || 'User-friendly name shown in UI'}
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('form.label.description') || 'Description'}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('form.placeholder.description') || 'Describe this role...'}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
          disabled={submitting}
        />
      </div>

      {/* Hierarchy Level */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('form.label.hierarchy_level') || 'Hierarchy Level'}
        </label>
        <input
          type="number"
          value={hierarchyLevel}
          onChange={(e) => setHierarchyLevel(parseInt(e.target.value) || 0)}
          min="0"
          max="100"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          disabled={submitting}
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('form.help.hierarchy_level') || 'Higher numbers have more authority (0-100)'}
        </p>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
            disabled={submitting || (role?.isSystemRole && !isCreate)}
          />
          <span className="text-sm font-medium text-gray-700">
            {t('form.label.is_active') || 'Active'}
          </span>
        </label>

        {isCreate && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isSystemRole}
              onChange={(e) => setIsSystemRole(e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              disabled={submitting}
            />
            <span className="text-sm font-medium text-gray-700">
              {t('form.label.is_system_role') || 'System Role (cannot be deleted)'}
            </span>
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          {t('form.button.cancel') || 'Cancel'}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? (t('form.button.submitting') || 'Submitting...')
            : isCreate
              ? (t('form.button.create') || 'Create Role')
              : (t('form.button.update') || 'Update Role')
          }
        </button>
      </div>
    </form>
  );
}

// ============================================
// src/presentation/features/user-roles/components/AssignRoleForm.tsx
// Component: Assign Role Form
// ============================================

'use client';

import React, { useState } from 'react';
import { AssignRoleDTO } from '@/src/core/domain/repositories/IUserRoleRepository';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

interface AssignRoleFormProps {
  users: Array<{ id: string; email: string }>;
  roles: Array<{ id: string; name: string; displayName: string }>;
  currentUserId: string;
  onSubmit: (data: AssignRoleDTO) => Promise<void>;
  onCancel: () => void;
}

export function AssignRoleForm({ users, roles, currentUserId, onSubmit, onCancel }: AssignRoleFormProps) {
  const { t } = useSupabaseTranslations('user_roles');
  const [userId, setUserId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId || !roleId) {
      setError(t('form.error.required') || 'Please select both user and role');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({ userId, roleId, assignedBy: currentUserId, notes: notes.trim() || undefined });
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900">{t('form.title') || 'Assign Role to User'}</h2>

      {error && <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">{error}</div>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('form.label.user') || 'User'} <span className="text-red-500">*</span></label>
        <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500" required disabled={submitting}>
          <option value="">{t('form.placeholder.select_user') || 'Select user...'}</option>
          {users.map(user => (<option key={user.id} value={user.id}>{user.email}</option>))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('form.label.role') || 'Role'} <span className="text-red-500">*</span></label>
        <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500" required disabled={submitting}>
          <option value="">{t('form.placeholder.select_role') || 'Select role...'}</option>
          {roles.map(role => (<option key={role.id} value={role.id}>{role.displayName}</option>))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('form.label.notes') || 'Notes'}</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg resize-none" disabled={submitting} />
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} disabled={submitting} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold">
          {t('form.button.cancel') || 'Cancel'}
        </button>
        <button type="submit" disabled={submitting} className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50">
          {submitting ? (t('form.button.submitting') || 'Assigning...') : (t('form.button.submit') || 'Assign Role')}
        </button>
      </div>
    </form>
  );
}

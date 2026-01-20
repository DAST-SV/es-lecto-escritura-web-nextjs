// ============================================
// src/presentation/features/role-language-access/components/CreateRoleLanguageAccessForm.tsx
// ============================================

'use client';

import React, { useState } from 'react';
import { CreateRoleLanguageAccessDTO } from '@/src/core/domain/repositories/IRoleLanguageAccessRepository';
import { LanguageCode } from '@/src/core/domain/entities/RoleLanguageAccess';

interface CreateRoleLanguageAccessFormProps {
  roles: Array<{ name: string; displayName: string }>;
  currentUserId: string;
  onSubmit: (data: CreateRoleLanguageAccessDTO) => Promise<void>;
  onCancel: () => void;
}

const LANGUAGES: Array<{ code: LanguageCode; name: string; flag: string }> = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
];

export function CreateRoleLanguageAccessForm({ roles, currentUserId, onSubmit, onCancel }: CreateRoleLanguageAccessFormProps) {
  const [roleName, setRoleName] = useState('');
  const [languageCode, setLanguageCode] = useState<LanguageCode>('es');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit({
        roleName,
        languageCode,
        createdBy: currentUserId,
      });
    } catch (err: any) {
      alert(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold">Grant Language Access to Role</h2>

      <div>
        <label className="block text-sm font-semibold mb-2">Role *</label>
        <select
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="w-full px-4 py-3 border-2 rounded-lg"
          required
          disabled={submitting}
        >
          <option value="">Select role...</option>
          {roles.map((r) => (
            <option key={r.name} value={r.name}>
              {r.displayName} ({r.name})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Language *</label>
        <select
          value={languageCode}
          onChange={(e) => setLanguageCode(e.target.value as LanguageCode)}
          className="w-full px-4 py-3 border-2 rounded-lg"
          disabled={submitting}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name} ({lang.code.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {submitting ? 'Granting...' : 'Grant Access'}
        </button>
      </div>
    </form>
  );
}

// ============================================
// src/presentation/features/route-permissions/components/CreatePermissionForm.tsx
// Component: Create Permission Form
// ============================================

'use client';

import React, { useState } from 'react';
import { CreateRoutePermissionDTO } from '@/src/core/domain/repositories/IRoutePermissionRepository';

interface CreatePermissionFormProps {
  roles: Array<{ name: string; displayName: string }>;
  routes: Array<{ id: string; path: string; name?: string }>;
  currentUserId: string;
  onSubmit: (data: CreateRoutePermissionDTO) => Promise<void>;
  onCancel: () => void;
}

export function CreatePermissionForm({ roles, routes, currentUserId, onSubmit, onCancel }: CreatePermissionFormProps) {
  const [roleName, setRoleName] = useState('');
  const [routeId, setRouteId] = useState('');
  const [languageCode, setLanguageCode] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!roleName || !routeId) {
      setError('Please select both role and route');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        roleName,
        routeId,
        languageCode: languageCode === 'all' ? null : languageCode,
        createdBy: currentUserId,
      });
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900">Create Route Permission</h2>

      {error && <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">{error}</div>}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Role <span className="text-red-500">*</span></label>
        <select value={roleName} onChange={(e) => setRoleName(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" required disabled={submitting}>
          <option value="">Select role...</option>
          {roles.map(role => <option key={role.name} value={role.name}>{role.displayName}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Route <span className="text-red-500">*</span></label>
        <select value={routeId} onChange={(e) => setRouteId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" required disabled={submitting}>
          <option value="">Select route...</option>
          {routes.map(route => <option key={route.id} value={route.id}>{route.path} {route.name && `(${route.name})`}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
        <select value={languageCode} onChange={(e) => setLanguageCode(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" disabled={submitting}>
          <option value="all">All Languages</option>
          <option value="es">Spanish (es)</option>
          <option value="en">English (en)</option>
          <option value="fr">French (fr)</option>
        </select>
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} disabled={submitting} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50">
          {submitting ? 'Creating...' : 'Create Permission'}
        </button>
      </div>
    </form>
  );
}

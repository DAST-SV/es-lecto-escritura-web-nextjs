// ============================================
// src/presentation/features/user-route-permissions/components/CreateUserPermissionForm.tsx
// ============================================

'use client';

import React, { useState } from 'react';
import { CreateUserRoutePermissionDTO } from '@/src/core/domain/repositories/IUserRoutePermissionRepository';
import { PermissionType } from '@/src/core/domain/entities/UserRoutePermission';

interface CreateUserPermissionFormProps {
  users: Array<{ id: string; email: string }>;
  routes: Array<{ id: string; path: string }>;
  currentUserId: string;
  onSubmit: (data: CreateUserRoutePermissionDTO) => Promise<void>;
  onCancel: () => void;
}

export function CreateUserPermissionForm({ users, routes, currentUserId, onSubmit, onCancel }: CreateUserPermissionFormProps) {
  const [userId, setUserId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [permissionType, setPermissionType] = useState<PermissionType>('GRANT');
  const [languageCode, setLanguageCode] = useState<string>('all');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onSubmit({
        userId,
        routeId,
        permissionType,
        languageCode: languageCode === 'all' ? null : languageCode,
        reason: reason.trim() || undefined,
        grantedBy: currentUserId,
      });
    } catch (err: any) {
      alert(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold">Create User Permission</h2>
      
      <div>
        <label className="block text-sm font-semibold mb-2">User *</label>
        <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" required disabled={submitting}>
          <option value="">Select user...</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Route *</label>
        <select value={routeId} onChange={(e) => setRouteId(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" required disabled={submitting}>
          <option value="">Select route...</option>
          {routes.map(r => <option key={r.id} value={r.id}>{r.path}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Permission Type *</label>
        <select value={permissionType} onChange={(e) => setPermissionType(e.target.value as PermissionType)} className="w-full px-4 py-3 border-2 rounded-lg" disabled={submitting}>
          <option value="GRANT">GRANT (Allow Access)</option>
          <option value="DENY">DENY (Block Access)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Language</label>
        <select value={languageCode} onChange={(e) => setLanguageCode(e.target.value)} className="w-full px-4 py-3 border-2 rounded-lg" disabled={submitting}>
          <option value="all">All Languages</option>
          <option value="es">Spanish</option>
          <option value="en">English</option>
          <option value="fr">French</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Reason</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full px-4 py-3 border-2 rounded-lg resize-none" disabled={submitting} />
      </div>

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onCancel} disabled={submitting} className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50">
          {submitting ? 'Creating...' : 'Create Permission'}
        </button>
      </div>
    </form>
  );
}

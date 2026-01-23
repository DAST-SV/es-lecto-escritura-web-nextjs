// ============================================
// src/presentation/features/organization-members/components/AddMemberModal.tsx
// Modal for adding a new organization member
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Building2, Mail, Shield } from 'lucide-react';
import { OrganizationMemberRole } from '@/src/core/domain/entities/OrganizationMember';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (organizationId: string, userId: string, role: OrganizationMemberRole, invitedBy: string) => Promise<void>;
  currentUserId: string;
}

interface Organization {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
}

const roleOptions: { value: OrganizationMemberRole; label: string; description: string }[] = [
  {
    value: 'owner',
    label: 'Propietario',
    description: 'Control total sobre la organización'
  },
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Puede gestionar miembros y configuraciones'
  },
  {
    value: 'member',
    label: 'Miembro',
    description: 'Acceso estándar a la organización'
  },
  {
    value: 'guest',
    label: 'Invitado',
    description: 'Acceso limitado de solo lectura'
  }
];

export function AddMemberModal({ isOpen, onClose, onAdd, currentUserId }: AddMemberModalProps) {
  const { t } = useSupabaseTranslations('organization_members');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<OrganizationMemberRole>('member');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadOrganizations();
      resetForm();
    }
  }, [isOpen]);

  const loadOrganizations = async () => {
    const supabase = createClient();

    // Get organizations where current user is admin or owner
    const { data: memberData } = await supabase
      .schema('app')
      .from('organization_members')
      .select('organization_id, user_role')
      .eq('user_id', currentUserId)
      .is('deleted_at', null);

    if (!memberData) return;

    // Filter to only admin/owner organizations
    const adminOrgIds = memberData
      .filter(m => m.user_role === 'owner' || m.user_role === 'admin')
      .map(m => m.organization_id);

    if (adminOrgIds.length === 0) {
      setOrganizations([]);
      return;
    }

    const { data: orgs } = await supabase
      .schema('app')
      .from('organizations')
      .select('id, name')
      .in('id', adminOrgIds)
      .is('deleted_at', null);

    setOrganizations(orgs || []);
    if (orgs && orgs.length > 0) {
      setSelectedOrgId(orgs[0].id);
    }
  };

  const searchUser = async () => {
    if (!userEmail.trim()) {
      setError(t('email_required') || 'Email is required');
      return;
    }

    setSearching(true);
    setError('');
    setFoundUser(null);

    try {
      const supabase = createClient();

      const { data, error: searchError } = await supabase
        .schema('auth')
        .from('users')
        .select('id, email, raw_user_meta_data')
        .eq('email', userEmail.trim().toLowerCase())
        .single();

      if (searchError || !data) {
        setError(t('user_not_found') || 'User not found with that email');
        return;
      }

      setFoundUser({
        id: data.id,
        email: data.email || '',
        full_name: data.raw_user_meta_data?.full_name || data.raw_user_meta_data?.name || data.email?.split('@')[0]
      });
    } catch (err) {
      setError(t('search_error') || 'Error searching for user');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrgId) {
      setError(t('organization_required') || 'Please select an organization');
      return;
    }

    if (!foundUser) {
      setError(t('search_user_first') || 'Please search for a user first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAdd(selectedOrgId, foundUser.id, selectedRole, currentUserId);
      onClose();
    } catch (err: any) {
      setError(err.message || t('add_error') || 'Error adding member');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUserEmail('');
    setFoundUser(null);
    setSelectedRole('member');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              {t('add_member_title') || 'Add Organization Member'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Organization Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Building2 className="w-4 h-4" />
              {t('select_organization') || 'Organization'}
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900"
              required
            >
              {organizations.length === 0 ? (
                <option value="">{t('no_organizations') || 'No organizations available'}</option>
              ) : (
                organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))
              )}
            </select>
            {organizations.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                {t('no_admin_orgs') || 'You must be an admin or owner to add members'}
              </p>
            )}
          </div>

          {/* User Email Search */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Mail className="w-4 h-4" />
              {t('user_email') || 'User Email'}
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder={t('email_placeholder') || 'Enter user email...'}
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900"
                required
              />
              <button
                type="button"
                onClick={searchUser}
                disabled={searching || !userEmail.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {searching ? t('searching') || 'Searching...' : t('search') || 'Search'}
              </button>
            </div>

            {/* Found User Display */}
            {foundUser && (
              <div className="mt-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                    {foundUser.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{foundUser.full_name}</p>
                    <p className="text-sm text-slate-600">{foundUser.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Shield className="w-4 h-4" />
              {t('select_role') || 'Member Role'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roleOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedRole(option.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedRole === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-slate-900">{option.label}</div>
                  <div className="text-sm text-slate-600 mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading || !foundUser || organizations.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('adding') || 'Adding...' : t('add_member') || 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

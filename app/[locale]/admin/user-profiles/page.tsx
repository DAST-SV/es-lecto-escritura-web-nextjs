// ============================================
// app/[locale]/admin/user-profiles/page.tsx
// Admin page for managing user profiles
// ============================================

'use client';

import React, { useState, useMemo } from 'react';
import { RouteGuard } from '@/src/presentation/features/permissions/components';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { useUserProfiles } from '@/src/presentation/features/user-profiles/hooks/useUserProfiles';
import {
  UserProfilesList,
  UserProfileForm,
  UserProfileCard
} from '@/src/presentation/features/user-profiles/components';
import { UserProfile } from '@/src/core/domain/entities/UserProfile';
import { CreateUserProfileDTO, UpdateUserProfileDTO } from '@/src/core/domain/repositories/IUserProfileRepository';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import {
  Users,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  UserCheck,
  Globe,
  TrendingUp
} from 'lucide-react';

export default function UserProfilesPage() {
  const { t, loading: translationsLoading } = useSupabaseTranslations('user_profiles');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { profiles, loading, error, createProfile, updateProfile, deleteProfile, refresh } = useUserProfiles();
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

  // Calculate statistics
  const stats = useMemo(() => {
    const total = profiles.length;
    const publicProfiles = profiles.filter(p => p.isPublic).length;
    const privateProfiles = profiles.filter(p => !p.isPublic).length;
    const completeProfiles = profiles.filter(p => p.isComplete()).length;
    const withAvatar = profiles.filter(p => p.hasAvatar()).length;
    const withContactInfo = profiles.filter(p => p.isContactInfoComplete()).length;
    const withNotifications = profiles.filter(p => p.hasNotificationsEnabled()).length;

    return {
      total,
      publicProfiles,
      privateProfiles,
      completeProfiles,
      withAvatar,
      withContactInfo,
      withNotifications,
      completionRate: total > 0 ? Math.round((completeProfiles / total) * 100) : 0,
    };
  }, [profiles]);

  const handleCreate = async (data: CreateUserProfileDTO | UpdateUserProfileDTO) => {
    try {
      await createProfile(data as CreateUserProfileDTO);
      setShowForm(false);
      alert(t('profile_created_success') || 'Profile created successfully!');
    } catch (err: any) {
      throw err; // Re-throw to let form handle the error
    }
  };

  const handleEdit = (profile: UserProfile) => {
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleUpdate = async (data: CreateUserProfileDTO | UpdateUserProfileDTO) => {
    if (!editingProfile) return;

    try {
      await updateProfile(editingProfile.id, data as UpdateUserProfileDTO, currentUserId);
      setShowForm(false);
      setEditingProfile(null);
      alert(t('profile_updated_success') || 'Profile updated successfully!');
    } catch (err: any) {
      throw err; // Re-throw to let form handle the error
    }
  };

  const handleDelete = async (profile: UserProfile) => {
    const confirmMessage =
      profile.userId === currentUserId
        ? t('confirm_delete_own') || 'Are you sure you want to delete your profile?'
        : t('confirm_delete') || `Are you sure you want to delete ${profile.displayName}'s profile?`;

    if (!confirm(confirmMessage)) return;

    try {
      await deleteProfile(profile.id, currentUserId);
      alert(t('profile_deleted_success') || 'Profile deleted successfully!');
    } catch (err: any) {
      alert(err.message || t('profile_delete_error') || 'Error deleting profile');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProfile(null);
  };

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {t('page_title') || 'User Profiles'}
                </h1>
                <p className="text-slate-600 mt-1">
                  {t('page_description') || 'Manage user profiles and preferences'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <QuickStat
                icon={<Users className="w-4 h-4" />}
                label="Total"
                value={stats.total}
                color="purple"
              />
              <QuickStat
                icon={<Eye className="w-4 h-4" />}
                label="Public"
                value={stats.publicProfiles}
                color="green"
              />
              <QuickStat
                icon={<EyeOff className="w-4 h-4" />}
                label="Private"
                value={stats.privateProfiles}
                color="amber"
              />
              <QuickStat
                icon={<CheckCircle className="w-4 h-4" />}
                label="Complete"
                value={stats.completeProfiles}
                color="blue"
              />
              <QuickStat
                icon={<UserCheck className="w-4 h-4" />}
                label="Avatars"
                value={stats.withAvatar}
                color="indigo"
              />
              <QuickStat
                icon={<Globe className="w-4 h-4" />}
                label="Contact"
                value={stats.withContactInfo}
                color="cyan"
              />
              <QuickStat
                icon={<TrendingUp className="w-4 h-4" />}
                label="Complete %"
                value={`${stats.completionRate}%`}
                color="pink"
              />
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
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">
                  {t('loading') || 'Loading profiles...'}
                </p>
              </div>
            </div>
          ) : showForm ? (
            /* Form View */
            <div className="max-w-3xl mx-auto">
              <UserProfileForm
                profile={editingProfile || undefined}
                userId={editingProfile ? editingProfile.userId : currentUserId}
                onSubmit={editingProfile ? handleUpdate : handleCreate}
                onCancel={handleCloseForm}
                isCreate={!editingProfile}
              />
            </div>
          ) : (
            <>
              {/* Profiles List */}
              <UserProfilesList
                profiles={profiles}
                currentUserId={currentUserId}
                onOpenAdd={() => setShowForm(true)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showAddButton={false}
              />

              {/* Detailed Stats Card */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                  label={t('total_profiles') || 'Total Profiles'}
                  value={stats.total}
                  color="purple"
                />
                <StatCard
                  label={t('public_profiles') || 'Public Profiles'}
                  value={stats.publicProfiles}
                  color="green"
                />
                <StatCard
                  label={t('complete_profiles') || 'Complete Profiles'}
                  value={stats.completeProfiles}
                  color="blue"
                />
                <StatCard
                  label={t('completion_rate') || 'Completion Rate'}
                  value={`${stats.completionRate}%`}
                  color="pink"
                />
              </div>
            </>
          )}

          {/* Info Card */}
          {!showForm && (
            <div className="mt-8 bg-white rounded-xl border-2 border-purple-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-purple-600">ℹ️</span>
                {t('info_title') || 'About User Profiles'}
              </h3>
              <ul className="space-y-2 text-slate-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>{t('info_1') || 'Each user can have one profile with personal information and preferences'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>{t('info_2') || 'Public profiles are visible to other users, private profiles are hidden'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>{t('info_3') || 'Complete profiles help build trust and improve user experience'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>{t('info_4') || 'Users can customize notification preferences and privacy settings'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>{t('info_5') || 'Deleted profiles are soft-deleted and can be restored if needed'}</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}

// ============================================
// Quick Stat Component
// ============================================

interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'purple' | 'green' | 'amber' | 'blue' | 'indigo' | 'cyan' | 'pink';
}

function QuickStat({ icon, label, value, color }: QuickStatProps) {
  const colorClasses = {
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    pink: 'bg-pink-50 border-pink-200 text-pink-700',
  };

  return (
    <div className={`p-3 rounded-lg border-2 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs font-medium opacity-80">{label}</p>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  label: string;
  value: number | string;
  color: 'purple' | 'green' | 'blue' | 'pink';
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600 bg-purple-50 border-purple-200 text-purple-700',
    green: 'from-green-500 to-green-600 bg-green-50 border-green-200 text-green-700',
    blue: 'from-blue-500 to-blue-600 bg-blue-50 border-blue-200 text-blue-700',
    pink: 'from-pink-500 to-pink-600 bg-pink-50 border-pink-200 text-pink-700',
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${colorClasses[color].split(' ').slice(2).join(' ')}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

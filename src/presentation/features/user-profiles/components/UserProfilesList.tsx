// ============================================
// src/presentation/features/user-profiles/components/UserProfilesList.tsx
// Component for displaying and filtering user profiles list
// ============================================

'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Filter,
  X
} from 'lucide-react';
import { UserProfile } from '@/src/core/domain/entities/UserProfile';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

interface UserProfilesListProps {
  profiles: UserProfile[];
  currentUserId?: string;
  onOpenAdd?: () => void;
  onEdit: (profile: UserProfile) => void;
  onDelete: (profile: UserProfile) => void;
  showAddButton?: boolean;
}

export function UserProfilesList({
  profiles,
  currentUserId,
  onOpenAdd,
  onEdit,
  onDelete,
  showAddButton = false
}: UserProfilesListProps) {
  const { t } = useSupabaseTranslations('user_profiles');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublic, setFilterPublic] = useState<'all' | 'public' | 'private'>('all');
  const [filterCity, setFilterCity] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique cities and countries for filters
  const cities = useMemo(() => {
    const uniqueCities = new Set(profiles.map(p => p.city).filter((c): c is string => Boolean(c)));
    return Array.from(uniqueCities).sort();
  }, [profiles]);

  const countries = useMemo(() => {
    const uniqueCountries = new Set(profiles.map(p => p.country).filter((c): c is string => Boolean(c)));
    return Array.from(uniqueCountries).sort();
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Search filter
      const matchesSearch =
        profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.country?.toLowerCase().includes(searchTerm.toLowerCase());

      // Public/Private filter
      const matchesPublic =
        filterPublic === 'all' ||
        (filterPublic === 'public' && profile.isPublic) ||
        (filterPublic === 'private' && !profile.isPublic);

      // City filter
      const matchesCity = !filterCity || profile.city === filterCity;

      // Country filter
      const matchesCountry = !filterCountry || profile.country === filterCountry;

      return matchesSearch && matchesPublic && matchesCity && matchesCountry;
    });
  }, [profiles, searchTerm, filterPublic, filterCity, filterCountry]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPublic('all');
    setFilterCity('');
    setFilterCountry('');
  };

  const hasActiveFilters = searchTerm || filterPublic !== 'all' || filterCity || filterCountry;

  return (
    <div className="flex-1 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-200">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1">
            <Users className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-800">
              {t('title') || 'User Profiles'}
            </h1>
            <span className="text-sm text-slate-500">
              ({filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'})
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('search_placeholder') || 'Search profiles...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-purple-200 bg-white focus:outline-none focus:border-purple-400 text-sm min-w-[200px]"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border font-medium text-sm flex items-center gap-2 transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-purple-700 border-purple-200 hover:border-purple-400'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-white text-purple-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  !
                </span>
              )}
            </button>

            {/* Add Profile Button */}
            {showAddButton && onOpenAdd && (
              <button
                onClick={onOpenAdd}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('add_profile') || 'Add Profile'}
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Advanced Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Visibility Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Visibility
                </label>
                <select
                  value={filterPublic}
                  onChange={(e) => setFilterPublic(e.target.value as 'all' | 'public' | 'private')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-purple-400"
                >
                  <option value="all">All Profiles</option>
                  <option value="public">Public Only</option>
                  <option value="private">Private Only</option>
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  City
                </label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-purple-400"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Country
                </label>
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-purple-400"
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profiles Table */}
      <div className="flex-1 overflow-auto">
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-400">
              {hasActiveFilters
                ? t('no_profiles_found') || 'No profiles found'
                : t('no_profiles') || 'No profiles yet'}
            </p>
            {!hasActiveFilters && showAddButton && onOpenAdd && (
              <button
                onClick={onOpenAdd}
                className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
              >
                {t('add_first_profile') || 'Add your first profile'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('profile') || 'Profile'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('email') || 'Email'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('location') || 'Location'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('age') || 'Age'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {t('visibility') || 'Visibility'}
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
                {filteredProfiles.map((profile) => (
                  <ProfileRow
                    key={profile.id}
                    profile={profile}
                    currentUserId={currentUserId}
                    onEdit={() => onEdit(profile)}
                    onDelete={() => onDelete(profile)}
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
// Profile Row Component
// ============================================

interface ProfileRowProps {
  profile: UserProfile;
  currentUserId?: string;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}

function ProfileRow({ profile, currentUserId, onEdit, onDelete, t }: ProfileRowProps) {
  const isCurrentUser = profile.userId === currentUserId;
  const location = profile.getLocation();
  const age = profile.getAge();
  const initials = profile.getInitials();

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      {/* Profile */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {profile.hasAvatar() && profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold">
              {initials}
            </div>
          )}
          <div>
            <div className="font-medium text-slate-900 flex items-center gap-2">
              {profile.displayName}
              {isCurrentUser && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {t('you') || 'You'}
                </span>
              )}
            </div>
            {profile.bio && (
              <div className="text-xs text-slate-500 line-clamp-1">
                {profile.bio}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-600">
          {profile.userEmail || 'N/A'}
        </div>
      </td>

      {/* Location */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {location ? (
            <>
              <MapPin className="w-4 h-4" />
              {location}
            </>
          ) : (
            'N/A'
          )}
        </div>
      </td>

      {/* Age */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
        {age !== null ? `${age} years` : 'N/A'}
      </td>

      {/* Visibility */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
          profile.isPublic
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-amber-100 text-amber-700 border border-amber-200'
        }`}>
          {profile.isPublic ? (
            <>
              <Eye className="w-3 h-3" />
              Public
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" />
              Private
            </>
          )}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
          profile.isComplete()
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {profile.isComplete() ? t('complete') || 'Complete' : t('incomplete') || 'Incomplete'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            title={t('edit_profile') || 'Edit Profile'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
            title={t('delete_profile') || 'Delete Profile'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

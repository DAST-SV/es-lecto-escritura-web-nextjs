// ============================================
// src/presentation/features/user-profiles/components/UserProfileCard.tsx
// Component for displaying a user profile card
// ============================================

'use client';

import React from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '@/src/core/domain/entities/UserProfile';

interface UserProfileCardProps {
  profile: UserProfile;
  onEdit?: (profile: UserProfile) => void;
  onDelete?: (profile: UserProfile) => void;
  showActions?: boolean;
}

export function UserProfileCard({
  profile,
  onEdit,
  onDelete,
  showActions = true
}: UserProfileCardProps) {
  const age = profile.getAge();
  const location = profile.getLocation();
  const initials = profile.getInitials();

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">

      {/* Header with Avatar */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 relative">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {profile.hasAvatar() && profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
              {initials}
            </div>
          )}

          {/* Name and Bio */}
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold">{profile.displayName}</h3>
              {profile.isComplete() && (
                <CheckCircle className="w-5 h-5 text-green-300" title="Complete Profile" />
              )}
            </div>

            {profile.bio && (
              <p className="text-blue-100 text-sm line-clamp-2 mt-1">
                {profile.bio}
              </p>
            )}

            {/* Visibility Badge */}
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                profile.isPublic
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
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
            </div>
          </div>
        </div>

        {/* Profile Completeness Indicator */}
        {!profile.isComplete() && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
              <AlertCircle className="w-3 h-3" />
              Incomplete
            </span>
          </div>
        )}
      </div>

      {/* Profile Details */}
      <div className="px-6 py-4 space-y-3">

        {/* Email */}
        {profile.userEmail && (
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700">{profile.userEmail}</span>
          </div>
        )}

        {/* Phone */}
        {profile.phoneNumber && (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700">{profile.phoneNumber}</span>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700">{location}</span>
          </div>
        )}

        {/* Age */}
        {age !== null && (
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700">{age} years old</span>
          </div>
        )}

        {/* Address */}
        {profile.address && (
          <div className="flex items-center gap-3 text-sm">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700 line-clamp-1">{profile.address}</span>
          </div>
        )}
      </div>

      {/* Badges Section */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
        <div className="flex flex-wrap gap-2">
          {profile.hasNotificationsEnabled() && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Notifications On
            </span>
          )}
          {profile.isContactInfoComplete() && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Contact Info
            </span>
          )}
          {profile.hasAvatar() && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              Has Avatar
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (onEdit || onDelete) && (
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(profile)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(profile)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}

      {/* Footer with Dates */}
      <div className="px-6 py-2 bg-slate-100 border-t border-slate-200 flex justify-between text-xs text-slate-500">
        <span>Created: {profile.createdAt.toLocaleDateString()}</span>
        <span>Updated: {profile.updatedAt.toLocaleDateString()}</span>
      </div>
    </div>
  );
}

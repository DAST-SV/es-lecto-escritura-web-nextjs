// ============================================
// src/presentation/features/user-profiles/components/UserProfileForm.tsx
// Component for editing user profiles with validation
// ============================================

'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Image as ImageIcon,
  FileText,
  Eye,
  EyeOff,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { UserProfile, UserPreferences } from '@/src/core/domain/entities/UserProfile';
import { CreateUserProfileDTO, UpdateUserProfileDTO } from '@/src/core/domain/repositories/IUserProfileRepository';

interface UserProfileFormProps {
  profile?: UserProfile;
  userId?: string;
  onSubmit: (data: CreateUserProfileDTO | UpdateUserProfileDTO) => Promise<void>;
  onCancel?: () => void;
  isCreate?: boolean;
}

export function UserProfileForm({
  profile,
  userId,
  onSubmit,
  onCancel,
  isCreate = false
}: UserProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    profile?.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : ''
  );
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [isPublic, setIsPublic] = useState(profile?.isPublic ?? true);

  // Preferences
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(
    profile?.getPreference('theme') || 'light'
  );
  const [emailNotifications, setEmailNotifications] = useState(
    profile?.getPreference('notifications.email') ?? true
  );
  const [pushNotifications, setPushNotifications] = useState(
    profile?.getPreference('notifications.push') ?? true
  );

  // Validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!displayName || displayName.trim() === '') {
      errors.displayName = 'Display name is required';
    } else if (displayName.length < 2) {
      errors.displayName = 'Display name must be at least 2 characters';
    } else if (displayName.length > 100) {
      errors.displayName = 'Display name must not exceed 100 characters';
    }

    if (bio && bio.length > 500) {
      errors.bio = 'Bio must not exceed 500 characters';
    }

    if (phoneNumber) {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(phoneNumber)) {
        errors.phoneNumber = 'Invalid phone number format';
      }
    }

    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 0 || age > 150) {
        errors.dateOfBirth = 'Invalid date of birth';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const preferences: UserPreferences = {
        theme,
        notifications: {
          email: emailNotifications,
          push: pushNotifications,
        },
      };

      if (isCreate && userId) {
        const dto: CreateUserProfileDTO = {
          userId,
          displayName: displayName.trim(),
          bio: bio.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
          isPublic,
          preferences,
        };
        await onSubmit(dto);
      } else {
        const dto: UpdateUserProfileDTO = {
          displayName: displayName.trim(),
          bio: bio.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          phoneNumber: phoneNumber.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          country: country.trim() || undefined,
          isPublic,
          preferences,
        };
        await onSubmit(dto);
      }
    } catch (err: any) {
      setError(err.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {isCreate ? 'Create Profile' : 'Edit Profile'}
        </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Basic Information
        </h3>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Display Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              validationErrors.displayName ? 'border-red-300' : 'border-slate-300'
            } focus:outline-none focus:border-blue-500`}
            placeholder="John Doe"
            required
          />
          {validationErrors.displayName && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.displayName}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              validationErrors.bio ? 'border-red-300' : 'border-slate-300'
            } focus:outline-none focus:border-blue-500`}
            placeholder="Tell us about yourself..."
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            {validationErrors.bio && (
              <p className="text-red-500 text-xs">{validationErrors.bio}</p>
            )}
            <p className="text-slate-400 text-xs ml-auto">{bio.length}/500</p>
          </div>
        </div>

        {/* Avatar URL */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <ImageIcon className="w-4 h-4 inline mr-1" />
            Avatar URL
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date of Birth
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              validationErrors.dateOfBirth ? 'border-red-300' : 'border-slate-300'
            } focus:outline-none focus:border-blue-500`}
          />
          {validationErrors.dateOfBirth && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.dateOfBirth}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-600" />
          Contact Information
        </h3>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              validationErrors.phoneNumber ? 'border-red-300' : 'border-slate-300'
            } focus:outline-none focus:border-blue-500`}
            placeholder="+1 234 567 8900"
          />
          {validationErrors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.phoneNumber}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
            placeholder="123 Main St"
          />
        </div>

        {/* City & Country */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
              placeholder="New York"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Globe className="w-4 h-4 inline mr-1" />
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
              placeholder="United States"
            />
          </div>
        </div>
      </div>

      {/* Privacy & Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Privacy & Preferences
        </h3>

        {/* Public Profile */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-3">
            {isPublic ? (
              <Eye className="w-5 h-5 text-green-600" />
            ) : (
              <EyeOff className="w-5 h-5 text-amber-600" />
            )}
            <div>
              <p className="font-medium text-slate-900">Public Profile</p>
              <p className="text-sm text-slate-500">
                Allow others to see your profile
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Theme Preference
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Notifications</p>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-slate-900 text-sm">Email Notifications</p>
              <p className="text-xs text-slate-500">Receive updates via email</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-slate-900 text-sm">Push Notifications</p>
              <p className="text-xs text-slate-500">Receive push notifications</p>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isCreate ? 'Create Profile' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

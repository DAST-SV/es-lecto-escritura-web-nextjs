// ============================================
// src/presentation/features/auth/components/RegisterFormFields.tsx
// Component: Register Form Fields with Name, Email, Password, Confirm Password
// ============================================
"use client";

import { Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface RegisterFormFieldsProps {
  formAction: (formData: FormData) => void;
  isPending: boolean;
  selectedRole?: string;
}

export function RegisterFormFields({
  formAction,
  isPending,
  selectedRole
}: RegisterFormFieldsProps) {
  const t = useTranslations('auth.register');
  const tErrors = useTranslations('auth.errors');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: FormData): boolean => {
    const errors: Record<string, string> = {};
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!name || name.trim().length < 2) {
      errors.name = tErrors('name_required');
    }

    if (!email || !email.includes('@')) {
      errors.email = tErrors('invalid_email');
    }

    if (!password || password.length < 6) {
      errors.password = tErrors('weak_password');
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = tErrors('password_mismatch');
    }

    if (!selectedRole) {
      errors.role = tErrors('role_required');
    }

    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (selectedRole) {
      formData.append('role', selectedRole);
    }

    if (validateForm(formData)) {
      formAction(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name Field */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {t('name_label')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={`block w-full pl-10 pr-3 py-2 border ${
              localErrors.name ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder={t('name_placeholder')}
            disabled={isPending}
          />
        </div>
        {localErrors.name && (
          <p className="text-xs text-red-500">{localErrors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t('email_label')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`block w-full pl-10 pr-3 py-2 border ${
              localErrors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder={t('email_placeholder')}
            disabled={isPending}
          />
        </div>
        {localErrors.email && (
          <p className="text-xs text-red-500">{localErrors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {t('password_label')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            className={`block w-full pl-10 pr-10 py-2 border ${
              localErrors.password ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder={t('password_placeholder')}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="text-sm text-gray-500">
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </span>
          </button>
        </div>
        {localErrors.password && (
          <p className="text-xs text-red-500">{localErrors.password}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          {t('confirm_password_label')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            className={`block w-full pl-10 pr-10 py-2 border ${
              localErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder={t('confirm_password_placeholder')}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="text-sm text-gray-500">
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </span>
          </button>
        </div>
        {localErrors.confirmPassword && (
          <p className="text-xs text-red-500">{localErrors.confirmPassword}</p>
        )}
      </div>

      {/* Role Error */}
      {localErrors.role && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{localErrors.role}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending || !selectedRole}
        className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${
          isPending || !selectedRole
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105'
        }`}
      >
        {isPending ? t('register_button_loading') : t('register_button')}
      </button>
    </form>
  );
}

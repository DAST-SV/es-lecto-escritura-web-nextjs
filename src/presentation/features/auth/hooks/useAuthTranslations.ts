// ============================================
// src/presentation/features/auth/hooks/useAuthTranslations.ts
// Hook para obtener traducciones de auth desde Supabase
// ============================================

'use client';

import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

/**
 * Hook específico para traducciones de autenticación
 * Usa el sistema de traducciones de Supabase
 */
export function useAuthTranslations() {
  const { t, loading, locale } = useSupabaseTranslations('auth');

  return {
    // Formularios
    form: {
      emailLabel: t('form.email_label'),
      emailPlaceholder: t('form.email_placeholder'),
      passwordLabel: t('form.password_label'),
      passwordPlaceholder: t('form.password_placeholder'),
      rememberMe: t('form.remember_me'),
      forgotPassword: t('form.forgot_password'),
      loginButton: t('form.login_button'),
      loginButtonLoading: t('form.login_button_loading'),
      connectWith: t('form.connect_with'),
      orUseEmail: t('form.or_use_email'),
    },

    // Login
    login: {
      title: t('login.title'),
      subtitle: t('login.subtitle'),
      noAccount: t('login.no_account'),
      registerLink: t('login.register_link'),
    },

    // Register
    register: {
      title: t('register.title'),
      subtitle: t('register.subtitle'),
      nameLabel: t('register.name_label'),
      namePlaceholder: t('register.name_placeholder'),
      confirmPasswordLabel: t('register.confirm_password_label'),
      confirmPasswordPlaceholder: t('register.confirm_password_placeholder'),
      roleLabel: t('register.role_label'),
      roleDescription: t('register.role_description'),
      registerButton: t('register.register_button'),
      registerButtonLoading: t('register.register_button_loading'),
      alreadyHaveAccount: t('register.already_have_account'),
      loginLink: t('register.login_link'),
    },

    // Roles
    roles: {
      student: {
        name: t('roles.student.name'),
        description: t('roles.student.description'),
        icon: t('roles.student.icon'),
      },
      teacher: {
        name: t('roles.teacher.name'),
        description: t('roles.teacher.description'),
        icon: t('roles.teacher.icon'),
      },
      parent: {
        name: t('roles.parent.name'),
        description: t('roles.parent.description'),
        icon: t('roles.parent.icon'),
      },
      school: {
        name: t('roles.school.name'),
        description: t('roles.school.description'),
        icon: t('roles.school.icon'),
      },
      individual: {
        name: t('roles.individual.name'),
        description: t('roles.individual.description'),
        icon: t('roles.individual.icon'),
      },
    },

    // Providers
    providers: {
      google: t('providers.google'),
      apple: t('providers.apple'),
      facebook: t('providers.facebook'),
      microsoft: t('providers.microsoft'),
      github: t('providers.github'),
    },

    // Errores
    errors: {
      invalidCredentials: t('errors.invalid_credentials'),
      emailNotConfirmed: t('errors.email_not_confirmed'),
      userNotFound: t('errors.user_not_found'),
      invalidEmail: t('errors.invalid_email'),
      weakPassword: t('errors.weak_password'),
      passwordMismatch: t('errors.password_mismatch'),
      emailAlreadyRegistered: t('errors.email_already_registered'),
      roleRequired: t('errors.role_required'),
      nameRequired: t('errors.name_required'),
    },

    // Mensajes
    messages: {
      loginSuccess: t('messages.login_success'),
      registerSuccess: t('messages.register_success'),
      logoutSuccess: t('messages.logout_success'),
      checkEmail: t('messages.check_email'),
      checkEmailDescription: t('messages.check_email_description'),
    },

    // Estados
    loading,
    locale,
  };
}
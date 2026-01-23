// ============================================
// 11. src/infrastructure/services/i18n/TranslationService.ts
// ============================================
import { getTranslations } from 'next-intl/server';

const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'invalid_credentials',
  'Email not confirmed': 'email_not_confirmed',
  'User not found': 'user_not_found',
  'Invalid email': 'invalid_email',
  'Password should be at least 6 characters': 'weak_password',
  'User already registered': 'email_already_registered',
  'Too many requests': 'too_many_requests',
};

export class TranslationService {
  static async translateAuthError(errorMessage: string): Promise<string> {
    const t = await getTranslations('auth.errors');
    const errorKey = ERROR_MAP[errorMessage];
    return errorKey ? t(errorKey) : t('generic_error');
  }
}
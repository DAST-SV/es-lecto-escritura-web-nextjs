// ============================================
// src/core/application/use-cases/navigation/GetNavigationItems.ts
// ============================================

import { NavigationItem } from '@/src/core/domain/entities/NavigationItem';
import { Locale } from '@/src/core/domain/value-objects/Locale';

interface NavItemConfig {
  key: string;
  requiresAuth: boolean;
}

interface NavigationConfig {
  public: NavItemConfig[];
  private: NavItemConfig[];
}

export class GetNavigationItems {
  private config: NavigationConfig = {
    public: [
      { key: 'about', requiresAuth: false },
      { key: 'auth.login', requiresAuth: false },
      { key: 'auth.register', requiresAuth: false },
    ],
    private: [
      { key: 'library', requiresAuth: true },
      { key: 'myWorld', requiresAuth: true },
      { key: 'myProgress', requiresAuth: true },
    ],
  };

  execute(
    isAuthenticated: boolean,
    locale: Locale,
    translator: (key: string) => { text: string; href: string; title: string }
  ): NavigationItem[] {
    const items = isAuthenticated ? this.config.private : this.config.public;

    return items.map((item: NavItemConfig) => {
      const translated = translator(item.key);
      return new NavigationItem(
        translated.text,
        `/${locale.code}${translated.href}`,
        translated.title,
        item.requiresAuth
      );
    });
  }
}
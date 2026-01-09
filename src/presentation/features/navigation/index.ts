// ============================================================================
// src/presentation/features/navigation/index.ts
// ============================================================================
// Exporta todos los componentes principales
export { default as NavBar } from './components/NavBar';
export { default as BrandLogo } from './components/BrandLogo';
export { default as LanguageSelector } from './components/LanguageSelector';
export { default as NavigationItems } from './components/NavigationItems';
export { default as UserMenu } from './components/UserMenu';
export { UnifiedLayout } from './components/Layout';

// Exporta los hooks
export { useAuth } from './hooks/useAuth';
export { useNavigation } from './hooks/useNavigation';
export { useLanguage } from './hooks/useLanguage';

// Exporta los tipos
export * from './types/navigation.types';
// ============================================================================
// src/presentation/features/navigation/types/navigation.types.ts
// ============================================================================
export interface NavItem {
  label: string;
  title: string;
  href: string;
}

export interface DesktopNavigationProps {
  navItems: NavItem[];
  userAvatar?: string;
  displayName?: string;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export interface NavigationItemsProps {
  items: NavItem[];
  isMobile?: boolean;
}

export interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavItem[];
  userAvatar?: string;
  displayName?: string;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export interface NavBarProps {
  brandName?: string;
  userAvatar?: string;
}

export interface MobileToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface UnifiedLayoutProps {
  children: React.ReactNode;
  backgroundComponent?: React.ReactNode;
  className?: string;
  mainClassName?: string;
  showNavbar?: boolean;
  brandName?: string;
  fullscreen?: boolean;
}

export interface UserMenuProps {
  userAvatar?: string;
  isMobile?: boolean;
  displayName?: string;
  onLogout: () => void;
}

export interface BrandLogoProps {
  brandName: string;
}

export interface LanguageWithFlag {
  code: string;
  country: string;
}

export interface BrowserNavControlsProps {
  className?: string;
}

export interface NavControlsToggleProps {
  isMobile?: boolean;
}
interface NavItem {
  label: string;
  title: string;
  href: string;
}

interface DesktopNavigationProps {
  navItems: NavItem[];
  userAvatar?: string;
  isAuthenticated: boolean;
  onLogout: () => void;
}

interface NavigationItemsProps {
  items: NavItem[];
  isMobile?: boolean;
}

interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavItem[];
  userAvatar?: string;
  isAuthenticated: boolean;
  onLogout: () => void;
}

interface NavBarProps {
    brandName?: string;
    userAvatar?: string;
}

interface MobileToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface UnifiedLayoutProps {
  children: React.ReactNode;
  backgroundComponent?: React.ReactNode;
  className?: string;
  mainClassName?: string;
  showNavbar?: boolean;
  brandName?: string;
}

interface UserMenuProps {
  userAvatar?: string;
  isMobile?: boolean;
}
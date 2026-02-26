// ============================================
// src/presentation/features/navigation/components/NavBar/NavBar.tsx
// ============================================
"use client";

import React, { useState, useEffect } from "react";
import BrandLogo from "../BrandLogo";
import MobileMenu from "./MobileMenu";
import DesktopNavigation from "./DesktopNavigation";
import MobileToggleButton from "./MobileToggleButton";
import { BrowserNavControls, NavControlsToggle } from "../BrowserNavControls";
import { BrowserNavProvider } from "../../context/BrowserNavContext";
import { useAuthNavigation } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { useAdminRole } from '../../hooks/useAdminRole';
import { NavBarProps } from '../../types/navigation.types';
import { NavBarDesktopSkeleton, NavBarMobileSkeleton } from './NavBarSkeleton';

const NavBar: React.FC<NavBarProps> = ({ brandName }) => {
  const defaultBrandName = brandName || "Eslectoescritura";

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user, loading: authLoading, logout } = useAuthNavigation();
  const { navigationItems } = useNavigation(!!user);
  const { isAdmin } = useAdminRole(user);

  // Solo esperar auth — las traducciones del nav se renderizan cuando lleguen
  const loading = authLoading;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = navigationItems.map(item => ({
    label: item.label,
    href: item.href,
    title: item.title,
  }));

  const userAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

  return (
    <BrowserNavProvider>
      <nav
        className={`pwa-navbar fixed top-0 left-0 w-full px-4 sm:px-6 py-3 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/60 backdrop-blur-lg shadow-md"
            : "bg-white/50 backdrop-blur-lg"
        }`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-1">
            <BrandLogo brandName={defaultBrandName} />
            <BrowserNavControls />
            <div className="hidden md:block">
              <NavControlsToggle />
            </div>
          </div>

          {loading ? (
            <NavBarDesktopSkeleton />
          ) : (
            <DesktopNavigation
              navItems={navItems}
              userAvatar={userAvatarUrl}
              displayName={displayName}
              onLogout={logout}
              isAuthenticated={!!user}
              isAdmin={isAdmin}
            />
          )}

          {loading ? (
            <NavBarMobileSkeleton />
          ) : (
            <MobileToggleButton
              isOpen={isMobileOpen}
              onToggle={() => setIsMobileOpen((prev) => !prev)}
            />
          )}
        </div>

        {!loading && (
          <MobileMenu
            isOpen={isMobileOpen}
            navItems={navItems}
            userAvatar={userAvatarUrl}
            displayName={displayName}
            onLogout={logout}
            isAuthenticated={!!user}
            isAdmin={isAdmin}
          />
        )}
      </nav>
    </BrowserNavProvider>
  );
};

export default NavBar;

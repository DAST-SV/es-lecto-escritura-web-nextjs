// ============================================
// src/presentation/features/navigation/components/NavBar/NavBar.tsx
// ACTUALIZADO para usar el nuevo hook
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
import { NavBarProps } from '../../types/navigation.types';
import { NavBarDesktopSkeleton, NavBarMobileSkeleton } from './NavBarSkeleton';

const NavBar: React.FC<NavBarProps> = ({ brandName, userAvatar }) => {
  const defaultBrandName = brandName || "Eslectoescritura";
  const defaultUserAvatar =
    userAvatar ||
    "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png";

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user, loading: authLoading, logout } = useAuthNavigation();
  const { navigationItems, loading: navLoading } = useNavigation(!!user);

  const loading = authLoading || navLoading;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navItems = navigationItems.map(item => ({
    label: item.label,
    href: item.href,
    title: item.title,
  }));

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
          {/* Seccion izquierda: Logo + Controles de navegacion + Toggle */}
          <div className="flex items-center gap-1">
            <BrandLogo brandName={defaultBrandName} />
            <BrowserNavControls />
            {/* Toggle solo visible en desktop */}
            <div className="hidden md:block">
              <NavControlsToggle />
            </div>
          </div>

          {loading ? (
            <NavBarDesktopSkeleton />
          ) : (
            <DesktopNavigation
              navItems={navItems}
              userAvatar={user?.user_metadata?.avatar_url || defaultUserAvatar}
              onLogout={logout}
              isAuthenticated={!!user}
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
            userAvatar={user?.user_metadata?.avatar_url || defaultUserAvatar}
            onLogout={logout}
            isAuthenticated={!!user}
          />
        )}
      </nav>
    </BrowserNavProvider>
  );
};

export default NavBar;

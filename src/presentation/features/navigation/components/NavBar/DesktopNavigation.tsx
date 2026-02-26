// ============================================================================
// src/presentation/features/navigation/components/NavBar/DesktopNavigation.tsx
// ============================================================================
"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { LayoutDashboard } from "lucide-react";
import NavigationItems from "../NavigationItems";
import LanguageSelector from "../LanguageSelector";
import UserMenu from "../UserMenu";
import { DesktopNavigationProps } from '../../types/navigation.types';

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  navItems,
  userAvatar,
  displayName,
  isAuthenticated,
  isAdmin,
  onLogout,
}) => {
  const locale = useLocale();

  return (
    <div className="hidden md:flex items-center space-x-4">
      {navItems.map((item) =>
        item.href === "#" ? (
          <button
            key={item.label}
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            {item.label}
          </button>
        ) : (
          <NavigationItems
            key={item.label}
            items={[item]}
          />
        )
      )}

      <LanguageSelector />

      {/* Botón Admin — solo visible para super_admin y school */}
      {isAuthenticated && isAdmin && (
        <Link
          href={`/${locale}/admin`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-md hover:shadow-indigo-300/60 hover:scale-105 active:scale-95 transition-all duration-200"
          title="Panel de Administración"
        >
          <LayoutDashboard size={14} />
          <span>Admin</span>
        </Link>
      )}

      {isAuthenticated && (
        <UserMenu
          userAvatar={userAvatar}
          displayName={displayName}
          onLogout={onLogout}
        />
      )}
    </div>
  );
};

export default DesktopNavigation;
// ============================================================================
// src/presentation/features/navigation/components/NavBar/MobileMenu.tsx
// ============================================================================
"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import NavigationItems from "../NavigationItems";
import LanguageSelector from "../LanguageSelector";
import UserMenu from "../UserMenu";
import { NavControlsToggle } from "../BrowserNavControls";
import { MobileMenuProps } from '../../types/navigation.types';

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  navItems,
  userAvatar,
  displayName,
  isAuthenticated,
  isAdmin,
  onLogout,
}) => {
  const locale = useLocale();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden mt-3 bg-white/60 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden"
        >
          <div className="flex flex-col space-y-2 px-4 py-3">
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
                <NavigationItems key={item.label} items={[item]} isMobile={true} />
              )
            )}

            {/* Botón Admin — solo super_admin y school */}
            {isAuthenticated && isAdmin && (
              <Link
                href={`/${locale}/admin`}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-md"
              >
                <LayoutDashboard size={16} />
                <span>Panel de Administración</span>
              </Link>
            )}

            {/* Toggle de controles de navegacion (atras/adelante/recargar) */}
            <NavControlsToggle isMobile />

            <div
              className={`flex items-center ${
                isAuthenticated ? "justify-between" : "justify-start"
              } mt-2`}
            >
              <LanguageSelector />
              {isAuthenticated && (
                <UserMenu
                  userAvatar={userAvatar}
                  displayName={displayName}
                  onLogout={onLogout}
                  isMobile={true}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
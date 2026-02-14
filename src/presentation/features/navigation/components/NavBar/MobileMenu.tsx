// ============================================================================
// src/presentation/features/navigation/components/NavBar/MobileMenu.tsx
// ============================================================================
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  onLogout,
}) => {
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
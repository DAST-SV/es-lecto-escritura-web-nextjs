"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavigationItems from "./NavigationItems";
import LanguageSelector from "./LanguageSelector";
import UserMenu from "./UserMenu";

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  navItems,
  userAvatar,
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

            <div
              className={`flex items-center ${
                isAuthenticated ? "justify-between" : "justify-start"
              } mt-2`}
            >
              <LanguageSelector />
              {isAuthenticated && userAvatar && (
                <UserMenu userAvatar={userAvatar} isMobile={true} />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
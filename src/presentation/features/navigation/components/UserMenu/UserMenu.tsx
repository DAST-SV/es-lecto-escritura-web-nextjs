// ============================================
// src/presentation/features/navigation/components/UserMenu/UserMenu.tsx
// ============================================
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut } from 'lucide-react';
import { UserMenuProps } from '../../types/navigation.types';

const UserMenu: React.FC<UserMenuProps> = ({
  userAvatar,
  isMobile = false,
  displayName,
  onLogout,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } catch (error) {
      console.error('Error inesperado al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
      setIsUserMenuOpen(false);
    }
  };

  const avatarClasses = isMobile
    ? "w-9 h-9 rounded-full object-cover shadow-sm"
    : "w-8 h-8 rounded-full object-cover";

  const buttonClasses = isMobile
    ? "p-1 rounded-full"
    : "cursor-pointer w-9 h-9 rounded-full bg-white bg-opacity-95 shadow-sm flex items-center justify-center transition-transform duration-200 hover:scale-110";

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsUserMenuOpen((prev) => !prev)}
        className={buttonClasses}
        whileHover={isMobile ? { scale: 1.1 } : undefined}
        whileTap={{ scale: 0.95 }}
        aria-label="User menu"
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt="User avatar"
            className={`cursor-pointer ${avatarClasses}`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`cursor-pointer ${avatarClasses} bg-indigo-500 flex items-center justify-center text-white font-semibold text-sm`}>
            {displayName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {isUserMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsUserMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-lg z-50 py-2"
            >
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700">{displayName}</p>
              </div>
              <button className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
                <Settings size={16} className="mr-2" />
                Configuración
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors ${
                  isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <LogOut size={16} className="mr-2" />
                {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;

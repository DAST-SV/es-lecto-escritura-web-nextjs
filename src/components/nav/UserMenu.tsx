"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/src/utils/supabase/client';

interface UserMenuProps {
  userAvatar?: string;
  isMobile?: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ 
  userAvatar = "https://csspicker.dev/api/image/?q=professional+avatar&image_type=photo",
  isMobile = false 
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const supabase = createClient();

  useEffect(() => {
    // Obtener usuario inicial
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // No renderizar nada si está cargando o no hay usuario
  if (loading || !user) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error);
      } else {
        console.log('Sesión cerrada exitosamente');
        router.push('/auth/login');
        router.refresh();
      }
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
        <img
          src={user.user_metadata?.avatar_url || userAvatar}
          alt="User avatar"
          className={`cursor-pointer ${avatarClasses}`}
        />
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
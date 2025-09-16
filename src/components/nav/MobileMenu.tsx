"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import NavigationItems from './NavigationItems';
import LanguageSelector from './LanguageSelector';
import UserMenu from './UserMenu';
import { createClient } from '@/src/utils/supabase/client';

interface MobileMenuProps {
  isOpen: boolean;
  navItems: string[];
  userAvatar?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  navItems, 
  userAvatar 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
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
            <NavigationItems items={navItems} isMobile={true} />

            <div className={`flex items-center ${user && !loading ? 'justify-between' : 'justify-start'} mt-2`}>
              <LanguageSelector />
              {!loading && user && <UserMenu userAvatar={userAvatar} isMobile={true} />}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
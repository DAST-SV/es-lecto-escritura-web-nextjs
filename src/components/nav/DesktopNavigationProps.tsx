"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import NavigationItems from './NavigationItems';
import LanguageSelector from './LanguageSelector';
import UserMenu from './UserMenu';
import { createClient } from '@/src/utils/supabase/client';

interface DesktopNavigationProps {
  navItems: string[];
  userAvatar?: string;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ 
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
    <div className="hidden md:flex items-center space-x-4">
      <NavigationItems items={navItems} />
      <LanguageSelector />
      {!loading && user && <UserMenu userAvatar={userAvatar} />}
    </div>
  );
};

export default DesktopNavigation;
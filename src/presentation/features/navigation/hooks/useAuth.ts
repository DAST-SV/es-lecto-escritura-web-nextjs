// ============================================
// src/presentation/features/navigation/hooks/useAuth.ts
// ✅ CORREGIDO: Inyectar cliente browser
// ============================================
"use client";

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/src/infrastructure/config/supabase.config'; // ✅ Import
import { GetCurrentUser } from '@/src/core/application/use-cases/auth/GetCurrentUser';
import { Logout } from '@/src/core/application/use-cases/auth/Logout';
import { SupabaseAuthRepository } from '@/src/infrastructure/repositories/SupabaseAuthRepository';

export const useAuthNavigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Crear cliente browser e inyectar
  const supabase = createClient();
  const authRepository = new SupabaseAuthRepository(supabase);
  
  const getCurrentUser = new GetCurrentUser(authRepository);
  const logout = new Logout(authRepository);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser.execute();
      setUser(currentUser);
      setLoading(false);
    };

    fetchUser();

    const unsubscribe = authRepository.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // ✅ Dependencias vacías está bien

  const handleLogout = async () => {
    await logout.execute();
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout: handleLogout,
  };
};
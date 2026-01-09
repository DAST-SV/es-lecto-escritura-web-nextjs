// ============================================
// src/presentation/features/navigation/hooks/useAuth.ts
// ============================================

"use client";

import { useState, useEffect } from 'react';
import { User } from '@/src/core/domain/entities/User';
import { GetCurrentUser } from '@/src/core/application/use-cases/auth/GetCurrentUser';
import { Logout } from '@/src/core/application/use-cases/auth/Logout';
import { SupabaseAuthRepository } from '@/src/infrastructure/repositories/SupabaseAuthRepository';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const authRepository = new SupabaseAuthRepository();
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
  }, []);

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
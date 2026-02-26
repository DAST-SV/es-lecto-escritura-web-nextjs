// ============================================
// src/presentation/features/navigation/hooks/useAdminRole.ts
// Detecta si el usuario tiene rol admin (super_admin o school)
// Solo hace la query UNA vez y la cachea en memoria mientras la sesión vive
// ============================================
'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/src/infrastructure/config/supabase.config';

const ADMIN_ROLES = ['super_admin', 'school'] as const;

export function useAdminRole(user: User | null) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    let cancelled = false;

    async function checkRole() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .schema('app')
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', user!.id)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        const roleName = (data as any)?.roles?.name ?? null;
        setIsAdmin(ADMIN_ROLES.includes(roleName));
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setAdminLoading(false);
      }
    }

    checkRole();
    return () => { cancelled = true; };
  }, [user?.id]);

  return { isAdmin, adminLoading };
}

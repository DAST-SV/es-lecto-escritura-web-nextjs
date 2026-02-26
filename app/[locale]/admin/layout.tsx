// ============================================
// app/[locale]/admin/layout.tsx
// ✅ Auth-only wrapper — NO añade estructura visual propia
//    Cada página admin maneja su propio UnifiedLayout / estilo
//    Esto elimina el hydration mismatch y el doble-wrap
// ============================================

'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createClient } from '@/src/infrastructure/config/supabase.config';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace(`/${locale}/auth/login?redirect=/${locale}/admin`);
    });
  }, [locale, router]);

  // Pasar hijos sin añadir nada — cada página admin gestiona su propio layout
  return <>{children}</>;
}

// ============================================
// 9. src/infrastructure/navigation/index.ts
// ============================================
import { createNavigation } from 'next-intl/navigation';
import { routing } from '../config/routing.config';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
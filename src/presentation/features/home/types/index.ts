/**
 * Tipos para la feature Home
 * @file src/presentation/features/home/types/index.ts
 */

import { LucideIcon } from 'lucide-react';

// ============================================
// HERO CAROUSEL
// ============================================

export interface HeroSlide {
  title: string;
  icon: string;
  description: string;
  button: string;
}

export interface HeroCarouselProps {
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
}

// ============================================
// FEATURES SECTION
// ============================================

export type FeatureTabId = 'personalized' | 'simplified' | 'flexibility';

export interface FeatureTab {
  id: FeatureTabId;
  label: string;
  title: string;
  content: string;
}

export interface Stat {
  number: string;
  label: string;
}

export interface FeaturesSectionProps {
  className?: string;
}

// ============================================
// CTA SECTION
// ============================================

export interface CTASectionProps {
  className?: string;
}

// ============================================
// NAVIGATION
// ============================================

export interface NavItem {
  text: string;
  href?: string;
  title: string;
}

export interface AuthNav {
  login: NavItem;
  register: NavItem;
}

export interface Navigation {
  about: NavItem;
  virtualTour: NavItem;
  auth: AuthNav;
  back: Omit<NavItem, 'href'>;
  home: NavItem;
  profile: NavItem;
  settings: NavItem;
  logout: NavItem;
  myDiary: NavItem;
  myBooks: NavItem;
  createBook: NavItem;
  explore: NavItem;
  myReadings: NavItem;
  activities: NavItem;
}

// ============================================
// CONTENT CATEGORIES
// ============================================

export interface AgeLevel {
  id: string;
  name: string;
  ageRange: string;
  description: string;
  color: string;
}

export interface ContentCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  isPremium: boolean;
}

export interface ContentCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  bgGradient: string;
  levels: AgeLevel[];
  previewContent: ContentCard[];
}

export interface CategoryPreviewProps {
  category: ContentCategory;
  selectedLevel: string;
  onLevelChange: (levelId: string) => void;
}

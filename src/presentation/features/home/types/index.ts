/**
 * Home Feature Types
 * @file src/presentation/features/home/types/index.ts
 */

export interface HeroSlide {
  title: string;
  icon: string;
  description: string;
  button: string;
  [key: string]: string; // Index signature for tArray compatibility
}

export type FeatureTabId = 'our_difference' | 'for_students' | 'for_parents' | 'for_teachers' | 'plans_and_pricing';

export interface FeatureTab {
  id: FeatureTabId;
  label: string;
  title: string;
  content: string;
  [key: string]: string; // Index signature for tArray compatibility
}

export interface Stat {
  number: string;
  label: string;
  [key: string]: string; // Index signature for tArray compatibility
}
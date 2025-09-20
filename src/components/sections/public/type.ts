import { StaticImageData } from 'next/image';

export interface HeroSlide {
  title: string;
  icon: string;
  description: string;
  button: string;
}

export interface FeatureTab {
  id: 'personalized' | 'simplified' | 'flexibility';
  label: string;
  title: string;
  content: string;
}

export interface Stat {
  number: string;
  label: string;
}

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

export interface Messages {
  layout: {
    meta: {
      title: string;
      description: string;
    };
  };
  nav: Navigation;
  hero: {
    slides: HeroSlide[];
  };
  features: {
    title: string;
    subtitle: string;
    tabs: FeatureTab[];
    button: string;
    stats: Stat[];
  };
  cta: {
    title: string;
    description: string;
    button: string;
  };
  buttons: {
    save: NavItem;
    cancel: NavItem;
  };
}

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
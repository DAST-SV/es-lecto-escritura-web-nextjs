// types.ts
export interface AgeLevel {
  id: string;
  name: string;
  ageRange: string;
  description: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  levels?: AgeLevel[];
}

export interface BookPage {
  content: string;
  image?: string;
  title: string;
  isLocked?: boolean;
  backgroundColor?: string;
  textSize?: 'small' | 'medium' | 'large';
  audioUrl?: string;
  words?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isPremium: boolean;
  coverImage: string;
  coverColor: string;
  pages: BookPage[];
  ageRange: string;
  level: string;
  category: string;
}

export interface Level extends AgeLevel {
  color: string;
  bgColor: string;
  textSize: 'small' | 'medium' | 'large';
  features: string[];
}

export interface SingleCategoryPageProps {
  category: ContentCategory;
}
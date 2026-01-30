/**
 * ============================================
 * TIPOS: Traducciones del Modulo de Libros
 * Interfaces para traducciones dinamicas
 * ============================================
 */

// ============================================
// SORT OPTIONS
// ============================================

export interface SortOption {
  value: string;
  label: string;
  [key: string]: string;
}

export type BookSortValue = 'recent' | 'popular' | 'rating' | 'title_asc' | 'title_desc';

// ============================================
// TTS SPEED OPTIONS
// ============================================

export interface TTSSpeedOption {
  value: string;
  label: string;
  [key: string]: string;
}

// ============================================
// BOOK EXPLORE TRANSLATIONS
// ============================================

export interface BookExploreHeroTranslations {
  badge: string;
  title: string;
  subtitle: string;
}

export interface BookExploreSearchTranslations {
  placeholder: string;
  clear: string;
}

export interface BookExploreResultsTranslations {
  count_singular: string;
  count_plural: string;
  empty: string;
  empty_filtered: string;
  empty_default: string;
}

export interface BookExploreFeaturedTranslations {
  title: string;
  subtitle: string;
}

// ============================================
// BOOK FILTERS TRANSLATIONS
// ============================================

export interface BookFiltersSortTranslations {
  title: string;
  recent: string;
  popular: string;
  rating: string;
  title_asc: string;
  title_desc: string;
}

export interface BookFiltersAccessTranslations {
  public: string;
  freemium: string;
  premium: string;
  community: string;
}

// ============================================
// BOOK CARD TRANSLATIONS
// ============================================

export interface BookCardTranslations {
  featured: string;
  new: string;
  readings: string;
  pages: string;
  years: string;
  view_book: string;
  no_cover: string;
  reviews: string;
}

// ============================================
// BOOK DETAIL TRANSLATIONS
// ============================================

export interface BookDetailTranslations {
  back: string;
  by_author: string;
  description: string;
  about_author: string;
  details: string;
  pages_count: string;
  reading_level: string;
  age_range: string;
  categories: string;
  genres: string;
  values: string;
  published_date: string;
  views: string;
  rating: string;
  reviews: string;
  start_reading: string;
  continue_reading: string;
  add_to_library: string;
  in_library: string;
  share: string;
  related_books: string;
  no_description: string;
  premium_content: string;
  free_preview: string;
}

// ============================================
// BOOK READER TRANSLATIONS
// ============================================

export interface BookReaderNavigationTranslations {
  page: string;
  of: string;
  previous: string;
  next: string;
  go_to_page: string;
}

export interface BookReaderControlsTranslations {
  fullscreen: string;
  exit_fullscreen: string;
  font_size: string;
  font_increase: string;
  font_decrease: string;
}

export interface BookReaderTTSTranslations {
  play: string;
  pause: string;
  stop: string;
  resume: string;
  speed: string;
  not_supported: string;
}

export interface BookReaderBookmarkTranslations {
  bookmark: string;
  bookmarked: string;
  remove_bookmark: string;
}

export interface BookReaderGeneralTranslations {
  back_to_detail: string;
  back_to_explore: string;
  loading: string;
  error_loading: string;
  no_content: string;
  reading_progress: string;
  completed: string;
}

// ============================================
// HELPER TYPES
// ============================================

/**
 * Tipo para formatear strings con placeholders
 * Ejemplo: formatTranslation("Pagina {current} de {total}", { current: 1, total: 10 })
 */
export type TranslationPlaceholders = Record<string, string | number>;

/**
 * Funcion helper para reemplazar placeholders en traducciones
 */
export function formatTranslation(
  template: string,
  placeholders: TranslationPlaceholders
): string {
  return Object.entries(placeholders).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    template
  );
}

/**
 * Tipo para el resultado del hook useSupabaseTranslations
 */
export interface UseTranslationsResult {
  t: (key: string) => string;
  tArray: <T extends Record<string, string>>(prefix: string, fields: string[]) => T[];
  tCount: (prefix: string, field: string) => number;
  hasTranslation: (key: string) => boolean;
  raw: Record<string, string>;
  loading: boolean;
  locale: string;
}

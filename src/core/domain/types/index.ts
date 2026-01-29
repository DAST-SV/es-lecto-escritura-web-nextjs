/**
 * ============================================
 * ARCHIVO 1: src/core/domain/types/index.ts
 * REEMPLAZAR TODO EL CONTENIDO
 * ============================================
 */

/**
 * ============================================
 * TIPOS DE DOMINIO - VERSIÓN LIMPIA
 * Un solo tipo para páginas, sin duplicados
 * ============================================
 */

// ============================================
// LAYOUTS
// ============================================
export type LayoutType = 
  | 'CoverLayout'
  | 'TextCenterLayout'
  | 'ImageLeftTextRightLayout'
  | 'TextLeftImageRightLayout'
  | 'SplitTopBottomLayout'
  | 'ImageFullLayout'
  | 'SplitLayout'
  | 'CenterImageDownTextLayout';

// ============================================
// BACKGROUNDS
// ============================================
export const BACKGROUND_PRESETS = {
  blanco: '#ffffff',
  crema: '#fef3c7',
  gris: '#f3f4f6',
  azul: '#dbeafe',
  verde: '#d1fae5',
  rosa: '#fce7f3',
  amarillo: '#fef9c3',
  naranja: '#fed7aa',
  morado: '#e9d5ff',
  rojo: '#fecaca',
  negro: '#1f2937',
  azulOscuro: '#1e3a5f',
  verdeOscuro: '#064e3b',
} as const;

export type BackgroundPresetKey = keyof typeof BACKGROUND_PRESETS;
export type BackgroundType = BackgroundPresetKey | string; // hex color o URL

// ============================================
// PÁGINA - TIPO ÚNICO
// ============================================

/**
 * UN SOLO tipo de página
 * Usado TANTO en editor como en visualización
 * Los archivos temporales (Blob) son opcionales
 */
export interface Page {
  id: string;
  layout: LayoutType;
  title: string;
  text: string;
  image: string | null;
  background: BackgroundType | null;
  
  // Archivos temporales (solo en editor)
  file?: Blob | null;
  backgroundFile?: Blob | null;
  
  // Opcionales (futuro)
  animation?: string;
  audio?: string;
  interactiveGame?: string;
  items?: string[];
  border?: string;
}

// ============================================
// METADATA DE LIBRO
// ============================================

export interface BookMetadata {
  titulo: string;
  autores: string[];
  personajes: string[];
  descripcion: string;
  portada: File | string | null;
  portadaUrl?: string | null;
  cardBackgroundImage?: File | null;
  cardBackgroundUrl?: string | null;
  selectedCategorias: number[];
  selectedGeneros: number[];
  selectedEtiquetas: number[];
  selectedValores: number[];
  selectedNivel: number | null;
}

// ============================================
// ERROR DE DOMINIO
// ============================================

export class EntityValidationError extends Error {
  constructor(public entityName: string, public validationErrors: string[]) {
    super(`Validación fallida en ${entityName}: ${validationErrors.join(', ')}`);
    this.name = 'EntityValidationError';
  }
}

// ============================================
// HELPERS
// ============================================

export function isValidLayout(value: string): value is LayoutType {
  const layouts: LayoutType[] = [
    'CoverLayout',
    'TextCenterLayout',
    'ImageLeftTextRightLayout',
    'TextLeftImageRightLayout',
    'SplitTopBottomLayout',
    'ImageFullLayout',
    'SplitLayout',
    'CenterImageDownTextLayout'
  ];
  return layouts.includes(value as LayoutType);
}

export function isBackgroundPreset(value: string): value is BackgroundPresetKey {
  return value in BACKGROUND_PRESETS;
}

export function isHexColor(value: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(value);
}

export function isImageUrl(value: string): boolean {
  return value.startsWith('http://') || 
         value.startsWith('https://') || 
         value.startsWith('blob:');
}

export function getBackgroundColor(value: string): string {
  if (isBackgroundPreset(value)) {
    return BACKGROUND_PRESETS[value];
  }
  if (isHexColor(value)) {
    return value;
  }
  return BACKGROUND_PRESETS.blanco;
}

export function createEmptyPage(id: string, layout: LayoutType = 'TextCenterLayout'): Page {
  return {
    id,
    layout,
    title: '',
    text: '',
    image: null,
    background: 'blanco',
    file: null,
    backgroundFile: null,
  };
}

/**
 * Limpiar página para enviar al backend
 * Elimina archivos temporales y URLs blob:
 */
export function sanitizePageForBackend(page: Page) {
  return {
    layout: page.layout,
    title: page.title || '',
    text: page.text || '',
    image: page.image && !page.image.startsWith('blob:') ? page.image : '',
    background: page.background && !page.background.startsWith('blob:') ? page.background : 'blanco',
  };
}

// ============================================
// ALIAS (mantener compatibilidad temporalmente)
// ============================================
/** @deprecated Usar Page directamente */
export type page = Page;

/** @deprecated Usar Page directamente */
export type PageEditor = Page;

/** @deprecated Usar Page directamente */
export type PageEditorData = Page;

// ============================================
// SISTEMA DE ACCESO
// ============================================

export type AccessType = 'public' | 'freemium' | 'premium' | 'community';

export interface BookAccessConfig {
  type: AccessType;
  freePageCount: number; // Páginas gratis en modo freemium
  pageAccessLevels?: Record<number, AccessType>; // page_number -> access_level
}

export interface UserAccessLevel {
  userId: string;
  hasSubscription: boolean;
  subscriptionPlan: SubscriptionPlan;
  communityMemberships: string[]; // IDs de comunidades
  canAccessPremium: boolean;
  canDownloadOffline: boolean;
  canCreateBooks: boolean;
}

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'unlimited';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due';

// ============================================
// COLABORADORES
// ============================================

export type CollaboratorRole = 'author' | 'co_author' | 'editor' | 'illustrator' | 'translator';

export interface BookCollaboratorData {
  userId: string;
  role: CollaboratorRole;
  displayOrder: number;
  isPrimary: boolean;
  contributionDescription?: string;
  // Datos del usuario para display
  userName?: string;
  userAvatarUrl?: string;
  authorUsername?: string;
  isVerified?: boolean;
}

// ============================================
// TRADUCCIONES DE LIBRO
// ============================================

export interface BookTranslationData {
  id?: string;
  bookId: string;
  languageCode: string;
  title: string;
  description?: string;
  coverUrl?: string;
  pdfUrl?: string;
  isOriginal: boolean;
  isActive: boolean;
}

export interface BookPageTranslationData {
  id?: string;
  bookPageId: string;
  languageCode: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
  audioTimestamps?: AudioTimestamp[];
  textOverlayData?: TextOverlayWord[];
}

// Para lectura guiada futura
export interface AudioTimestamp {
  word: string;
  start: number; // segundos
  end: number;
}

export interface TextOverlayWord {
  word: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================
// PERFILES DE AUTOR
// ============================================

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface AuthorProfileData {
  userId: string;
  username: string;
  authorBio?: string;
  shortBio?: string;
  bannerUrl?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  socialLinks: SocialLinks;
  isVerified: boolean;
  isPublic: boolean;
  isAcceptingCollaborations: boolean;
  totalFollowers: number;
  totalBooks: number;
  totalViews: number;
  averageRating: number;
  createdAt: Date;
}

// ============================================
// COMUNIDADES
// ============================================

export type MembershipStatus = 'active' | 'cancelled' | 'expired' | 'pending' | 'paused';
export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

export interface CommunityPlanData {
  id: string;
  communityId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingPeriod: BillingPeriod;
  benefits: string[];
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}

export interface CommunityData {
  id: string;
  authorId: string;
  name: string;
  description?: string;
  shortDescription?: string;
  slug: string;
  coverUrl?: string;
  welcomeMessage?: string;
  isActive: boolean;
  requiresApproval: boolean;
  totalMembers: number;
  plans: CommunityPlanData[];
  createdAt: Date;
}

export interface CommunityMembershipData {
  id: string;
  communityId: string;
  userId: string;
  planId: string;
  status: MembershipStatus;
  startedAt: Date;
  expiresAt?: Date;
  cancelledAt?: Date;
}

// ============================================
// RATINGS Y REVIEWS
// ============================================

export interface BookRatingData {
  id: string;
  bookId: string;
  userId: string;
  rating: number; // 1-5
  createdAt: Date;
}

export interface BookReviewData {
  id: string;
  bookId: string;
  userId: string;
  title?: string;
  content: string;
  isApproved: boolean;
  isFeatured: boolean;
  helpfulCount: number;
  createdAt: Date;
  // Datos del usuario para display
  userName?: string;
  userAvatarUrl?: string;
  userRating?: number;
}

export interface BookRatingStats {
  totalRatings: number;
  averageRating: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
  totalReviews: number;
}

// ============================================
// GEOGRAFÍA
// ============================================

export interface CountryData {
  code: string;
  name: string;
  region: string;
  subregion?: string;
}

// ============================================
// FILTROS DE EXPLORACIÓN
// ============================================

export interface BookExploreFilters {
  categories?: number[];
  genres?: number[];
  levels?: number[];
  values?: number[];
  tags?: number[];
  languages?: string[];
  countries?: string[];
  accessTypes?: AccessType[];
  minRating?: number;
  searchTerm?: string;
  sortBy?: BookSortOption;
  authorId?: string;
  communityId?: string;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}

export type BookSortOption =
  | 'recent'
  | 'popular'
  | 'rating'
  | 'trending'
  | 'title_asc'
  | 'title_desc';

// ============================================
// CATÁLOGOS CON TRADUCCIÓN
// ============================================

export interface CatalogItemTranslated {
  id: number;
  name: string;
  description?: string;
  slug?: string;
}

export interface LevelItemTranslated extends CatalogItemTranslated {
  minAge: number;
  maxAge: number;
}

// ============================================
// METADATA EXTENDIDA DE LIBRO
// ============================================

export interface BookMetadataExtended extends BookMetadata {
  accessType: AccessType;
  freePageCount: number;
  originalLanguage: string;
  countryCode?: string;
  collaborators: BookCollaboratorData[];
  translations: BookTranslationData[];
}
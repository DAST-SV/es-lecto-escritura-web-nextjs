// ============================================
// Ruta: src/core/domain/repositories/index.ts
// Descripción: Barrel export de todas las interfaces de repositorios
// ============================================

// Languages
export type { 
  ILanguageRepository, 
  CreateLanguageDTO, 
  UpdateLanguageDTO 
} from './ILanguageRepository';

// Translation Namespaces
export type { 
  ITranslationNamespaceRepository, 
  CreateTranslationNamespaceDTO, 
  UpdateTranslationNamespaceDTO 
} from './ITranslationNamespaceRepository';

// Translation Categories
export type { 
  ITranslationCategoryRepository, 
  CreateTranslationCategoryDTO, 
  UpdateTranslationCategoryDTO 
} from './ITranslationCategoryRepository';

// Translation Keys
export type { 
  ITranslationKeyRepository, 
  CreateTranslationKeyDTO, 
  UpdateTranslationKeyDTO 
} from './ITranslationKeyRepository';

// Translations
export type {
  ITranslationRepository,
  CreateTranslationDTO,
  BulkCreateTranslationDTO,
  UpdateTranslationDTO
} from './ITranslationRepository';

// Books Extended
export type {
  IBookPageRepository,
  CreateBookPageDTO,
  UpdateBookPageDTO
} from './IBookPageRepository';

export type {
  IBookExploreRepository,
  BookExploreResult,
  BookSearchResult,
  RelatedBooksResult,
  TrendingBooksResult
} from './IBookExploreRepository';

// Author Profiles
export type {
  IAuthorProfileRepository,
  CreateAuthorProfileDTO,
  UpdateAuthorProfileDTO,
  AuthorSearchFilters
} from './IAuthorProfileRepository';

// Communities
export type {
  ICommunityRepository,
  CreateCommunityDTO,
  UpdateCommunityDTO,
  CreateCommunityPlanDTO,
  UpdateCommunityPlanDTO,
  JoinCommunityDTO
} from './ICommunityRepository';

// Ratings and Reviews
export type {
  IBookRatingRepository
} from './IBookRatingRepository';

export type {
  IBookReviewRepository,
  CreateReviewDTO,
  UpdateReviewDTO,
  ReviewFilters
} from './IBookRatingRepository';

// Book Translations
export type {
  IBookTranslationRepository
} from './IBookTranslationRepository';

// Book Collaborators
export type {
  IBookCollaboratorRepository
} from './IBookCollaboratorRepository';

// Book Access
export type {
  IBookAccessRepository
} from './IBookAccessRepository';

// Catalog Translations
export type {
  ICatalogTranslationRepository
} from './ICatalogTranslationRepository';
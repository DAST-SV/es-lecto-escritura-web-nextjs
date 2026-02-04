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

// Book Categories (schema books)
export type {
  IBookCategoryRepository,
  CreateBookCategoryDTO,
  UpdateBookCategoryDTO
} from './IBookCategoryRepository';

// Book Levels (schema books)
export type {
  IBookLevelRepository,
  CreateBookLevelDTO,
  UpdateBookLevelDTO
} from './IBookLevelRepository';

// Book Genres (schema books)
export type {
  IBookGenreRepository,
  CreateBookGenreDTO,
  UpdateBookGenreDTO
} from './IBookGenreRepository';

// Book Tags (schema books)
export type {
  IBookTagRepository,
  CreateBookTagDTO,
  UpdateBookTagDTO
} from './IBookTagRepository';

// Book Authors (schema books)
export type {
  IBookAuthorRepository,
  CreateBookAuthorDTO,
  UpdateBookAuthorDTO
} from './IBookAuthorRepository';

// Book Admin (schema books - gestión completa)
export type {
  IBookAdminRepository,
  CreateBookAdminDTO,
  UpdateBookAdminDTO,
  CreateBookTranslationDTO,
  UpdateBookTranslationDTO,
  BookAuthorDTO,
  BookGenreDTO,
  BookTagDTO
} from './IBookAdminRepository';

// Book Reviews (schema books)
export type {
  IBookReviewRepository as IBookReviewRepository2,
  CreateBookReviewDTO,
  UpdateBookReviewDTO
} from './IBookReviewRepository';

// Book Ratings (schema books)
export type {
  IBookRatingRepository2,
  CreateBookRatingDTO,
  UpdateBookRatingDTO,
  BookRatingStats
} from './IBookRatingRepository2';

// Reading Progress (schema books)
export type {
  IReadingProgressRepository,
  CreateReadingProgressDTO,
  UpdateReadingProgressDTO
} from './IReadingProgressRepository';

// Reading Sessions (schema books)
export type {
  IReadingSessionRepository,
  CreateReadingSessionDTO,
  EndReadingSessionDTO
} from './IReadingSessionRepository';

// Favorites (schema books)
export type {
  IFavoriteRepository,
  CreateFavoriteDTO
} from './IFavoriteRepository';

// Reading Lists (schema books)
export type {
  IReadingListRepository,
  CreateReadingListDTO,
  UpdateReadingListDTO,
  AddBookToListDTO
} from './IReadingListRepository';

// Book Pages (schema books)
export type {
  IBookPageRepository2,
  CreateBookPageDTO as CreateBookPageDTO2,
  UpdateBookPageDTO as UpdateBookPageDTO2,
  CreatePageTranslationDTO
} from './IBookPageRepository2';
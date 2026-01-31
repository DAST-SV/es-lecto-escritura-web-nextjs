// src/presentation/hooks/api/index.ts
// Exportaciones centralizadas de hooks de API

// ============================================
// BOOKS
// ============================================
export {
  bookKeys,
  useMyBooks,
  useBook,
  useExploreBooks,
  useInfiniteExploreBooks,
  useFeaturedBooks,
  usePopularBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
} from './use-books';

// ============================================
// CATALOG
// ============================================
export {
  catalogKeys,
  useCategories,
  useGenres,
  useLevels,
  useCatalogs,
} from './use-catalog';

// ============================================
// AUTH
// ============================================
export {
  authKeys,
  useCurrentUser,
  useIsAuthenticated,
  useSession,
  useAuth,
} from './use-auth';

// ============================================
// PROFILE
// ============================================
export {
  profileKeys,
  useMyProfile,
  usePublicProfile,
  useCreateProfile,
  useUpdateProfile,
  useProfile,
} from './use-profile';

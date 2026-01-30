// src/core/application/use-cases/books-catalog/index.ts

// Queries
export { getCategoriesQuery, type GetCategoriesParams } from './queries/get-categories.query';
export { getBooksByCategoryQuery, type GetBooksByCategoryParams } from './queries/get-books-by-category.query';
export { getBookDetailQuery, type GetBookDetailParams } from './queries/get-book-detail.query';
export { getBookPagesQuery, type GetBookPagesParams } from './queries/get-book-pages.query';
export { searchBooksQuery, type SearchBooksParams } from './queries/search-books.query';
export { getFeaturedBooksQuery, type GetFeaturedBooksParams } from './queries/get-featured-books.query';

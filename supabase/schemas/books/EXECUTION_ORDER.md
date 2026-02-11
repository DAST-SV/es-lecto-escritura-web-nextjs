# Schema BOOKS - Orden de Ejecucion

> Ejecutar despues de `schemas/app/`

## 1. Inicializacion
```
00_init.sql
```

## 2. Enums
```
enums/difficulty_level.sql
enums/book_status.sql
```

## 3. Tablas Base
```
tables/categories.sql
tables/levels.sql
tables/genres.sql
tables/tags.sql
tables/values.sql
tables/authors.sql
```

## 4. Tablas con Traducciones
```
tables/category_translations.sql
tables/level_translations.sql
tables/genre_translations.sql
tables/tag_translations.sql
tables/value_translations.sql
tables/author_translations.sql
```

## 5. Tabla Principal
```
tables/books.sql
tables/book_translations.sql
```

## 6. Tablas de Relacion
```
tables/book_authors.sql
tables/book_genres.sql
tables/book_tags.sql
tables/book_values.sql
tables/book_characters.sql
```

## 7. Paginas
```
tables/pages.sql
tables/page_translations.sql
```

## 8. Interaccion de Usuario
```
tables/book_ratings.sql
tables/book_reviews.sql
tables/reading_progress.sql
tables/reading_sessions.sql
tables/favorites.sql
tables/reading_lists.sql
```

## 9. Triggers
```
triggers/updated_at.sql
triggers/update_page_count.sql
```

## 10. Funciones
```
functions/get_book_by_language.sql
functions/get_books_by_category.sql
functions/get_book_pages.sql
functions/get_categories_by_language.sql
functions/search_books.sql
```

## 11. Vistas
```
views/v_categories_with_translations.sql
views/v_books_with_translations.sql
```

## 12. RLS y Politicas
```
rls/categories_policies.sql
rls/levels_policies.sql
rls/genres_policies.sql
rls/tags_policies.sql
rls/values_policies.sql
rls/authors_policies.sql
rls/books_policies.sql
rls/pages_policies.sql
rls/ratings_policies.sql
rls/reading_policies.sql
rls/characters_policies.sql
```

## 13. Storage Buckets
```
storage/book_covers.sql
storage/book_pdfs.sql
storage/book_audio.sql
storage/user_avatars.sql
```

## 14. Datos Iniciales (Seed)
```
data/categories.sql
data/seed_categories.sql
data/seed_levels.sql
data/seed_genres.sql
data/seed_tags.sql
data/seed_values.sql
```

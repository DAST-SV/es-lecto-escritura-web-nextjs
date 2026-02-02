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
tables/authors.sql
```

## 4. Tablas con FK
```
tables/books.sql
tables/pages.sql
tables/book_authors.sql
tables/category_translations.sql
tables/author_translations.sql
tables/book_translations.sql
tables/page_translations.sql
```

## 5. Funciones
```
functions/get_book_by_language.sql
functions/get_books_by_category.sql
functions/get_categories_by_language.sql
functions/get_book_pages.sql
functions/search_books.sql
```

## 6. Triggers
```
triggers/updated_at.sql
triggers/update_page_count.sql
```

## 7. Views
```
views/v_books_with_translations.sql
views/v_categories_with_translations.sql
```

## 8. RLS
```
rls/categories_policies.sql
rls/books_policies.sql
rls/authors_policies.sql
rls/pages_policies.sql
```

## 9. Datos
```
data/categories.sql
```

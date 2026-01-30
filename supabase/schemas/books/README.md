# supabase/schemas/books/README.md

# Módulo Books - Sistema de Libros Multiidioma

Sistema profesional de gestión de libros con soporte completo para traducciones en múltiples idiomas.

## Estructura del Módulo

```
books/
├── 00_init.sql                    # Inicialización del schema
├── enums/
│   ├── book_status.sql            # Estados de libros (draft, pending, published, archived)
│   └── difficulty_level.sql       # Niveles de dificultad
├── tables/
│   ├── categories.sql             # Categorías base
│   ├── category_translations.sql  # Traducciones de categorías
│   ├── authors.sql                # Autores base
│   ├── author_translations.sql    # Traducciones de autores
│   ├── books.sql                  # Libros base
│   ├── book_translations.sql      # Traducciones de libros (título, descripción)
│   ├── book_authors.sql           # Relación libro-autor
│   ├── pages.sql                  # Páginas de libros
│   └── page_translations.sql      # Contenido traducido de páginas
├── functions/
│   ├── get_book_by_language.sql       # Obtener libro en un idioma
│   ├── get_books_by_category.sql      # Listar libros por categoría
│   ├── get_categories_by_language.sql # Listar categorías traducidas
│   ├── get_book_pages.sql             # Obtener páginas de un libro
│   └── search_books.sql               # Buscar libros por texto
├── rls/
│   ├── categories_policies.sql    # Políticas para categorías
│   ├── books_policies.sql         # Políticas para libros
│   ├── authors_policies.sql       # Políticas para autores
│   └── pages_policies.sql         # Políticas para páginas
├── triggers/
│   ├── updated_at.sql             # Auto-actualización de updated_at
│   └── update_page_count.sql      # Sincronización de conteo de páginas
├── views/
│   ├── v_books_with_translations.sql      # Vista completa de libros
│   └── v_categories_with_translations.sql # Vista de categorías
└── data/
    └── categories.sql             # Datos seed de categorías
```

## Modelo de Datos

### Patrón de Traducción

Cada entidad principal tiene una tabla de traducciones asociada:

```
categories ←→ category_translations
authors    ←→ author_translations
books      ←→ book_translations
pages      ←→ page_translations
```

### Idiomas Soportados

- `es` - Español (por defecto)
- `en` - Inglés
- `fr` - Francés

## Orden de Ejecución

1. `00_init.sql` - Crear schema
2. `enums/*.sql` - Crear tipos enum
3. `tables/*.sql` - Crear tablas (en orden de dependencias)
4. `triggers/*.sql` - Crear triggers
5. `rls/*.sql` - Crear políticas de seguridad
6. `functions/*.sql` - Crear funciones
7. `views/*.sql` - Crear vistas
8. `data/*.sql` - Insertar datos iniciales

## Uso desde el Frontend

### Obtener categorías traducidas

```typescript
const { data } = await supabase
  .rpc('get_categories_by_language', { p_language_code: 'es' });
```

### Obtener libro con traducciones

```typescript
const { data } = await supabase
  .rpc('get_book_by_language', {
    p_book_id: 'uuid-del-libro',
    p_language_code: 'en'
  });
```

### Buscar libros

```typescript
const { data } = await supabase
  .rpc('search_books', {
    p_query: 'caperucita',
    p_language_code: 'es',
    p_limit: 10
  });
```

### Usar vistas con JSON de traducciones

```typescript
const { data } = await supabase
  .from('v_books_with_translations')
  .select('*')
  .eq('status', 'published');

// Acceder a traducciones
const title = data[0].translations['es'].title;
```

## Niveles de Dificultad

| Nivel | Edad recomendada |
|-------|------------------|
| beginner | 3-5 años |
| elementary | 6-8 años |
| intermediate | 9-11 años |
| advanced | 12+ años |

## Categorías Incluidas

| Slug | ES | EN | FR |
|------|----|----|-----|
| stories | Cuentos | Stories | Contes |
| poems | Poemas | Poems | Poèmes |
| fables | Fábulas | Fables | Fables |
| legends | Leyendas | Legends | Légendes |
| tongue-twisters | Trabalenguas | Tongue Twisters | Virelangues |
| rhymes | Rimas | Rhymes | Comptines |
| comics | Cómics | Comics | Bandes Dessinées |
| riddles | Adivinanzas | Riddles | Devinettes |
| literacy | Lectoescritura | Literacy | Alphabétisation |

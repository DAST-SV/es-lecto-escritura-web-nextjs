# 📚 Schema: Books

Sistema completo de gestión de libros digitales interactivos.

## 🎯 Estructura

```
books/
├── 00_init.sql                    # Inicialización del schema y permisos
├── catalogs/
│   └── tables.sql                 # Tablas de catálogo (types, levels, categories, etc.)
├── tables/
│   ├── book_authors.sql           # Autores
│   ├── book_characters.sql        # Personajes
│   ├── books.sql                  # Tabla principal de libros
│   ├── book_pages.sql             # Páginas de libros
│   ├── book_audit_logs.sql        # Logs de auditoría
│   └── book_views.sql             # Registro de visualizaciones
├── relations/
│   └── all_relations.sql          # Tablas de relación N:M
├── functions/
│   ├── update_updated_at.sql      # Actualizar timestamp
│   ├── audit_trigger.sql          # Función de auditoría
│   ├── validate_publishing.sql    # Validación para publicar
│   ├── soft_delete_book.sql       # Eliminación lógica
│   ├── increment_views.sql        # Incrementar vistas
│   ├── duplicate_book.sql         # Duplicar libro
│   ├── search_books.sql           # Búsqueda full-text
│   └── cleanup_audit_logs.sql     # Limpieza de logs
├── triggers/
│   └── all_triggers.sql           # Todos los triggers
├── views/
│   ├── books_full_info.sql        # Vista completa de libros
│   └── book_statistics.sql        # Estadísticas por libro
├── rls/
│   └── all_policies.sql           # Políticas de Row Level Security
├── storage/
│   └── buckets.sql                # Configuración de buckets
├── expose/
│   └── public_views.sql           # Exponer al API REST
├── analytics/
│   ├── tables.sql                 # Tablas de analytics
│   ├── functions.sql              # Funciones de analytics
│   └── rls.sql                    # RLS de analytics
└── data.sql                       # Datos iniciales (seeds)
```

---

## 📦 Descripción de Módulos

### 1. 📚 Catálogos (`catalogs/`)
Tablas de referencia para clasificación de libros:
- `book_types` - Tipos (oficial, usuario)
- `book_levels` - Niveles por edad
- `book_categories` - Categorías literarias
- `book_values` - Valores educativos
- `book_genres` - Géneros literarios
- `book_languages` - Idiomas disponibles
- `book_tags` - Etiquetas temáticas

### 2. 📖 Tablas Principales (`tables/`)
- `books` - Información principal del libro
- `book_pages` - Contenido de cada página
- `book_authors` - Autores
- `book_characters` - Personajes
- `book_views` - Visualizaciones
- `book_audit_logs` - Auditoría

### 3. 🔗 Relaciones (`relations/`)
Tablas de relación many-to-many:
- `books_authors`, `books_characters`
- `books_categories`, `books_values`
- `books_genres`, `books_languages`
- `books_tags`

### 4. ⚙️ Funciones (`functions/`)
- Búsqueda full-text con ranking
- Duplicación de libros
- Validación de publicación
- Soft delete
- Auditoría automática

### 5. 📊 Analytics (`analytics/`)
Sistema de estadísticas de lectura:
- `book_reading_sessions` - Sesiones de lectura
- `book_page_views` - Vistas por página
- `user_book_progress` - Progreso del usuario
- `book_statistics` - Estadísticas agregadas

### 6. 🔒 Seguridad (`rls/`)
Row Level Security con políticas para:
- Service role (acceso total)
- Usuarios autenticados (sus propios libros)
- Público (libros publicados)

### 7. 💾 Storage (`storage/`)
Buckets configurados:
- `book-images` - Imágenes (5MB max)
- `book-pdfs` - PDFs (50MB max)

---

## 🚀 Orden de Ejecución

```sql
-- 1. Inicialización
\i 00_init.sql

-- 2. Catálogos
\i catalogs/tables.sql

-- 3. Tablas principales
\i tables/book_authors.sql
\i tables/book_characters.sql
\i tables/books.sql
\i tables/book_pages.sql
\i tables/book_audit_logs.sql
\i tables/book_views.sql

-- 4. Relaciones
\i relations/all_relations.sql

-- 5. Funciones
\i functions/update_updated_at.sql
\i functions/audit_trigger.sql
\i functions/validate_publishing.sql
\i functions/soft_delete_book.sql
\i functions/increment_views.sql
\i functions/duplicate_book.sql
\i functions/search_books.sql
\i functions/cleanup_audit_logs.sql

-- 6. Triggers
\i triggers/all_triggers.sql

-- 7. Vistas
\i views/books_full_info.sql
\i views/book_statistics.sql

-- 8. RLS
\i rls/all_policies.sql

-- 9. Storage
\i storage/buckets.sql

-- 10. Exponer al API
\i expose/public_views.sql

-- 11. Analytics
\i analytics/tables.sql
\i analytics/functions.sql
\i analytics/rls.sql

-- 12. Datos iniciales
\i data.sql
```

---

## 📊 Estadísticas

| Componente | Cantidad |
|------------|----------|
| Tablas principales | 6 |
| Tablas de catálogo | 7 |
| Tablas de relación | 7 |
| Tablas de analytics | 4 |
| Funciones | 8 |
| Triggers | 3 |
| Vistas | 2 |
| Políticas RLS | 40+ |

---

**Versión:** 2.0 - Estructura Modular
**Actualizado:** 2026-01-27

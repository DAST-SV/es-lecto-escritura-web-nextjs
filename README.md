# 📚 Sistema de Gestión de Libros Digitales Interactivos

Sistema completo de creación, edición y lectura de libros digitales con analytics integrado, construido con **Clean Architecture**.

## 📋 Tabla de Contenidos

- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Capas de la Arquitectura](#-capas-de-la-arquitectura)
- [Base de Datos](#️-base-de-datos)
- [Seguridad](#-seguridad)
- [Flujos Principales](#-flujos-principales)
- [Tecnologías](#️-tecnologías)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Migraciones](#️-migraciones)
- [Características](#-características)
- [Scripts Disponibles](#-scripts-disponibles)
- [Principios de Diseño](#-principios-de-diseño)
- [Troubleshooting](#-troubleshooting)

---

## 🏗️ Arquitectura del Sistema

Este proyecto implementa **Clean Architecture** con separación clara de responsabilidades:
```
┌─────────────────────────────────────────────────────────┐
│                    Presentación                          │
│            (React, Next.js, Componentes)                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Aplicación                              │
│              (Casos de Uso, Lógica)                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Dominio                                │
│         (Entidades, Tipos, Interfaces)                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Infraestructura                             │
│     (Supabase, Storage, Servicios Externos)              │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto
```
eslectoescritura/
├── 📱 app/                          # Next.js App Router
│   └── [locale]/                    # Rutas internacionalizadas
│       ├── error/                  # ❌ Errores
│       ├── layout.tsx              # 🎨 Layout principal
│       ├── loading.tsx             # ⏳ Loading
│       └── page.tsx                # 🏠 Home
│
├── 🎯 src/core/                     # CAPA DE DOMINIO
│   ├── domain/
│   │   ├── entities/               # Entidades del dominio
│   │   │   └── index.ts           # Book entity
│   │   ├── types/                 # Tipos compartidos
│   │   │   └── index.ts           # Page, BookMetadata
│   │   ├── errors/                # Errores de dominio
│   │   │   └── DomainError.ts
│   │   └── repositories/          # Interfaces
│   │
│   └── application/                # CASOS DE USO
│       └── use-cases/
│
├── 🔧 src/infrastructure/           # CAPA DE INFRAESTRUCTURA
│   ├── repositories/
│   │
│   └── services/
│
├── 🎨 src/presentation/             # CAPA DE PRESENTACIÓN
│   └── features/
│           └── hooks/
│
├── middleware.ts                    # Middleware Next.js
├── next.config.mjs                  # Config Next.js
├── tailwind.config.ts              # Config Tailwind
├── tsconfig.json                   # TypeScript config
└── package.json                    # Dependencias
```

---

## 🎯 Capas de la Arquitectura

### 1️⃣ Capa de Dominio (`src/core/domain/`)

**Lógica de negocio pura** sin dependencias externas.
```typescript
// Entidades
- Book
- Page
- BookMetadata

// Tipos
- LayoutType
- BackgroundType
- Page (interfaz única)

// Errores
- EntityValidationError
- DomainError

// Repositorios (interfaces)
- IBookRepository
- IAuditRepository
```

**✅ Principio**: Esta capa NO conoce frameworks ni bases de datos.

---

### 2️⃣ Capa de Aplicación (`src/core/application/`)

**Casos de uso** que orquestan la lógica.

#### 📚 Casos de Uso de Libros:
```typescript
✅ CreateBook      // Crear libro con validaciones
✅ UpdateBook      // Actualizar libro existente
✅ DeleteBook      // Eliminación lógica
✅ HardDeleteBook  // Eliminación permanente
✅ RestoreBook     // Restaurar desde papelera
✅ GetBook         // Obtener libro completo
✅ GetBooksByUser  // Listar libros del usuario
```

#### 🔍 Casos de Uso de Auditoría:
```typescript
✅ AuditBooks  // Detectar inconsistencias
```

**✅ Principio**: Los casos de uso NO conocen implementaciones concretas.

---

### 3️⃣ Capa de Infraestructura (`src/infrastructure/`)

**Implementaciones concretas** con tecnologías externas.

#### 📦 Repositorios:
```typescript
BookRepository      // CRUD con Supabase
AuditRepository     // Auditoría de integridad
```

#### 🛠️ Servicios:
```typescript
BookImageService            // 🖼️ Subida de imágenes
BookPDFService             // 📄 Gestión de PDFs
PDFExtractorService        // 🔄 Extracción de páginas
BookReadingAnalyticsService // 📊 Tracking de lectura
```

**✅ Principio**: Adapta tecnologías externas a interfaces del dominio.

---

### 4️⃣ Capa de Presentación (`src/presentation/` + `app/`)

**Componentes React/Next.js** que consumen casos de uso.

#### 🎨 Componentes Principales:
```typescript
BookFormView        // Formulario crear/editar
PDFPreviewMode      // Visor con flip-book
OptimizedSelector   // Selector paginado
AutoresInput        // Input de autores
PersonajesInput     // Input de personajes
```

#### 🪝 Hooks Personalizados:
```typescript
useBookForm           // Gestión del formulario
useReadingAnalytics   // Tracking de lectura
```

**✅ Principio**: Solo esta capa conoce React y Next.js.

---

## 🗄️ Base de Datos

### Schema: `books`

#### 📊 Tablas Principales:

| Tabla | Descripción |
|-------|-------------|
| `books` | Libros (con soft delete) |
| `book_pages` | Páginas individuales |
| `book_authors` | Catálogo de autores |
| `book_characters` | Catálogo de personajes |

#### 🔗 Tablas de Relación (Many-to-Many):

| Tabla | Relación |
|-------|----------|
| `books_authors` | Libros ↔ Autores |
| `books_characters` | Libros ↔ Personajes |
| `books_categories` | Libros ↔ Categorías |
| `books_genres` | Libros ↔ Géneros |
| `books_tags` | Libros ↔ Etiquetas ✅ |
| `books_values` | Libros ↔ Valores educativos |

#### 📋 Catálogos:
```sql
book_types          -- Tipos de libro (oficial/usuario)
book_levels         -- Niveles por edad
book_categories     -- Categorías literarias
book_genres         -- Géneros literarios
book_tags           -- Etiquetas temáticas ✅
book_values         -- Valores educativos
book_languages      -- Idiomas disponibles
```

#### 📊 Analytics:
```sql
book_reading_sessions    -- Sesiones de lectura
book_page_views         -- Vistas de páginas
user_book_progress      -- Progreso del usuario
book_statistics         -- Estadísticas agregadas
```

#### 📦 Storage:
```
📁 book-images/         -- Portadas y páginas
   └── {user_id}/
       └── {book_id}/
           ├── covers/
           ├── pages/
           └── backgrounds/

📁 book-pdfs/          -- Archivos PDF
   └── {user_id}/
       └── {book_id}/
           └── document.pdf
```

---

## 🔐 Seguridad

### Row Level Security (RLS)

✅ **Usuarios autenticados**:
- Solo pueden modificar **sus propios libros**
- Pueden ver todos los **libros publicados**

✅ **Usuarios anónimos**:
- Solo pueden ver **libros publicados**

✅ **Service Role**:
- Acceso total a todas las tablas

### Storage Policies
```sql
-- Usuarios solo pueden subir a su carpeta
(storage.foldername(name))[1] = auth.uid()::text

-- Lectura pública para todos los archivos
bucket_id = 'book-images' OR bucket_id = 'book-pdfs'
```

---

## 🚀 Flujos Principales

### 📝 Flujo de Creación de Libros
```
Usuario
  ↓
BookFormView (Presentación)
  ↓
useBookForm (Hook)
  ↓
CreateBookUseCase (Aplicación)
  ↓
BookRepository (Infraestructura)
  ↓
Supabase (Base de Datos)
```

#### Proceso Detallado:

1. **Usuario sube PDF** → `PDFExtractorService` extrae páginas
2. **Subir archivos** → `BookPDFService` + `BookImageService`
3. **Guardar metadata** → `BookRepository`
4. **Crear relaciones** → Autores, Categorías, Géneros, Etiquetas ✅, Valores

---

### 📖 Flujo de Lectura con Analytics
```
Usuario abre libro
  ↓
PDFPreviewMode (Visor)
  ↓
useReadingAnalytics (Hook)
  ↓
BookReadingAnalyticsService
  ↓
Supabase (Tracking)
```

#### Tracking Registrado:
```typescript
✅ Inicio/fin de sesión
✅ Páginas visitadas
✅ Tiempo en cada página
✅ Progreso del usuario
✅ Completitud del libro
✅ Tipo de dispositivo
```

---

### 🗑️ Flujo de Soft Delete
```
Usuario elimina libro
  ↓
SoftDeleteBookUseCase
  ↓
Se marca deleted_at = NOW()
  ↓
Libro aparece en /books/trash
  ↓
[30 días de espera]
  ↓
Opción 1: RestoreBook
Opción 2: HardDeleteBook (permanente)
```

---

## 🛠️ Tecnologías

### Core

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 15.1.3 | Framework React |
| **React** | 19.0.0 | UI Library |
| **TypeScript** | ^5 | Type Safety |
| **Tailwind CSS** | ^3.4.1 | Estilos |

### Backend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Supabase** | ^2.49.2 | Backend as a Service |
| **PostgreSQL** | - | Base de datos |

### Librerías Específicas

| Librería | Uso |
|----------|-----|
| `react-pdf` | Renderizado de PDFs |
| `pdfjs-dist` | Procesamiento de PDFs |
| `react-pageflip` | Efecto flip-book |
| `next-intl` | Internacionalización |
| `lucide-react` | Iconos |
| `react-hot-toast` | Notificaciones |

---

## 📦 Instalación

### 1. Clonar Repositorio
```bash
git clone https://github.com/tu-usuario/eslectoescritura.git
cd eslectoescritura
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Ejecutar Migraciones

Desde **Supabase Dashboard** > **SQL Editor**, ejecutar en orden:
```bash
1. 01_books_schema.sql
2. 02_books_triggers_rls.sql
3. 03_books_seed_data.sql
4. 04_storage_bucket_setup.sql
5. 05_expose_books_schema.sql
6. 06_reading_analytics_schema.sql
```

### 5. Crear Buckets Manualmente

En **Supabase Dashboard** > **Storage**:
```
✅ Crear bucket: book-images (público)
✅ Crear bucket: book-pdfs (público)
```

### 6. Iniciar Desarrollo
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 🔑 Variables de Entorno

### Requeridas
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Opcionales
```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗄️ Migraciones

### Orden de Ejecución
```bash
# 1. Schema principal (tablas, índices, comentarios)
01_books_schema.sql

# 2. Triggers, funciones, RLS
02_books_triggers_rls.sql

# 3. Datos iniciales (catálogos)
03_books_seed_data.sql

# 4. Configuración de Storage
04_storage_bucket_setup.sql

# 5. Exposición del schema al API
05_expose_books_schema.sql

# 6. Sistema de analytics
06_reading_analytics_schema.sql
```

### Verificación
```sql
-- Ver tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'books';

-- Ver políticas RLS
SELECT * FROM pg_policies 
WHERE schemaname = 'books';

-- Ver buckets
SELECT * FROM storage.buckets;
```

---

## ✨ Características

### 📚 Gestión de Libros

✅ Crear libros con formulario intuitivo  
✅ Subir archivo PDF directo  
✅ Extracción automática de páginas  
✅ Gestión de portadas e imágenes  
✅ Edición completa de libros  
✅ Soft delete con papelera de 30 días  
✅ Hard delete permanente  
✅ Restauración desde papelera  

### 🏷️ Sistema de Clasificación

✅ Autores (múltiples por libro)  
✅ Personajes (múltiples por libro)  
✅ Categorías (con selector paginado)  
✅ Géneros literarios  
✅ **Etiquetas temáticas** (totalmente integrado)  
✅ Valores educativos  
✅ Niveles por edad  

### 📖 Lector de Libros

✅ Visor con efecto flip-book  
✅ Navegación con teclado (flechas, ESC)  
✅ Responsive (desktop, tablet, móvil)  
✅ Controles auto-ocultables  
✅ Páginas pre-renderizadas  

### 📊 Sistema de Analytics

✅ Registro de sesiones de lectura  
✅ Tracking de páginas visitadas  
✅ Tiempo en cada página  
✅ Progreso del usuario  
✅ Porcentaje de completitud  
✅ Comparación con otros lectores  
✅ Estadísticas del libro  
✅ Dispositivos más usados  

### 🔍 Panel de Administración

✅ Dashboard con estadísticas  
✅ Auditoría de integridad  
✅ Detección de archivos huérfanos  
✅ Detección de relaciones rotas  
✅ Limpieza automática  
✅ Reportes descargables  

### 🌐 Catálogo Público

✅ Listado de libros publicados  
✅ Búsqueda y filtros  
✅ Vista grid/list  
✅ Paginación  
✅ Indicador de libros propios  

---

## 📝 Scripts Disponibles
```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Compilar para producción
npm run start        # Iniciar servidor de producción

# Utilidades
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
```

---

## 🎨 Principios de Diseño

### 1. **Clean Architecture**
- Separación clara de capas
- Dependencias unidireccionales (hacia dentro)
- Dominio independiente de frameworks

### 2. **SOLID**
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 3. **DRY** (Don't Repeat Yourself)
- Componentes reutilizables
- Hooks personalizados
- Servicios compartidos

### 4. **Type Safety**
- TypeScript estricto
- Tipos compartidos
- Validaciones en tiempo de compilación

### 5. **Security First**
- Row Level Security (RLS)
- Autenticación obligatoria
- Validación de permisos

---

## 🐛 Troubleshooting

### Problema: Buckets no existen
```bash
# Solución: Crear manualmente en Supabase Dashboard
Storage > New Bucket > book-images (público)
Storage > New Bucket > book-pdfs (público)
```

### Problema: Error al subir imágenes
```bash
# Verificar permisos de Storage
# Ejecutar: 04_storage_bucket_setup.sql
# Verificar políticas en Supabase Dashboard
```

### Problema: Tablas no visibles en API
```bash
# Ejecutar: 05_expose_books_schema.sql
# O añadir 'books' al search_path en Supabase Dashboard
```

### Problema: Analytics no funciona
```bash
# Verificar que existe la tabla: user_book_progress
# Ejecutar: 06_reading_analytics_schema.sql
```

### Problema: PDFs no se procesan
```bash
# Verificar que pdfjs worker está cargando
# Revisar consola del navegador
# Verificar que el bucket book-pdfs existe
```

---

## 📚 Documentación Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React PDF Documentation](https://react-pdf.org/)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [GitHub](https://github.com/tu-usuario)

---

## 🙏 Agradecimientos

- Equipo de Supabase por su excelente plataforma
- Comunidad de Next.js por sus recursos
- Todos los contribuidores del proyecto

---

**Desarrollado con ❤️ siguiendo Clean Architecture**
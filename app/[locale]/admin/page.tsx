// app/[locale]/admin/page.tsx
// ✅ Mismo patron visual que login: from-blue-400 via-blue-300 to-green-300
//    Tarjetas blancas con border-yellow-300, fuente Nunito, UnifiedLayout
'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { LoginBackground } from '@/src/presentation/features/auth/components';
import {
  LayoutDashboard, BookOpen, Users, FileSearch,
  Languages, Key, Route as RouteIcon, Globe, Building2,
  Shield, UserCircle, FolderTree, Layers, Sparkles,
  Tags, UserPen, MessageSquare, Star, TrendingUp,
  Clock, Heart, List, FileText, Tag,
} from 'lucide-react';

const FONT = "Nunito, 'Varela Round', Comfortaa, sans-serif";

// ─────────────────────────────────────────────────────────────
// Configuración de módulos
// ─────────────────────────────────────────────────────────────
const MODULES = [
  // RBAC
  { key: 'route_scanner',        route: '/admin/route-scanner',        label: 'Escanear Rutas',          icon: <RouteIcon size={20} />,    color: 'bg-blue-100 text-blue-600 border-blue-200',    dot: 'bg-blue-400' },
  { key: 'route_translations',   route: '/admin/route-translations',   label: 'Rutas Traducidas',         icon: <Globe size={20} />,        color: 'bg-cyan-100 text-cyan-600 border-cyan-200',    dot: 'bg-cyan-400' },
  { key: 'roles',                route: '/admin/roles',                 label: 'Roles',                   icon: <Shield size={20} />,       color: 'bg-purple-100 text-purple-600 border-purple-200', dot: 'bg-purple-400' },
  { key: 'role_permissions',     route: '/admin/role-permissions',     label: 'Permisos de Roles',        icon: <Key size={20} />,          color: 'bg-indigo-100 text-indigo-600 border-indigo-200', dot: 'bg-indigo-400' },
  { key: 'user_roles',           route: '/admin/user-roles',           label: 'Roles de Usuarios',        icon: <Users size={20} />,        color: 'bg-violet-100 text-violet-600 border-violet-200', dot: 'bg-violet-400' },
  { key: 'user_permissions',     route: '/admin/user-permissions',     label: 'Permisos de Usuarios',     icon: <Shield size={20} />,       color: 'bg-pink-100 text-pink-600 border-pink-200',    dot: 'bg-pink-400' },
  { key: 'route_permissions',    route: '/admin/route-permissions',    label: 'Permisos de Rutas',        icon: <RouteIcon size={20} />,    color: 'bg-sky-100 text-sky-600 border-sky-200',       dot: 'bg-sky-400' },
  // Usuarios
  { key: 'users',                route: '/admin/users',                 label: 'Usuarios',                icon: <Users size={20} />,        color: 'bg-green-100 text-green-600 border-green-200', dot: 'bg-green-400' },
  { key: 'user_profiles',        route: '/admin/user-profiles',        label: 'Perfiles de Usuario',      icon: <UserCircle size={20} />,   color: 'bg-teal-100 text-teal-600 border-teal-200',    dot: 'bg-teal-400' },
  { key: 'user_relationships',   route: '/admin/user-relationships',   label: 'Relaciones',               icon: <Users size={20} />,        color: 'bg-emerald-100 text-emerald-600 border-emerald-200', dot: 'bg-emerald-400' },
  { key: 'role_language_access', route: '/admin/role-language-access', label: 'Acceso por Idioma',        icon: <Globe size={20} />,        color: 'bg-blue-100 text-blue-600 border-blue-200',    dot: 'bg-blue-400' },
  // Organizaciones
  { key: 'organizations',        route: '/admin/organizations',         label: 'Organizaciones',          icon: <Building2 size={20} />,    color: 'bg-orange-100 text-orange-600 border-orange-200', dot: 'bg-orange-400' },
  { key: 'organization_members', route: '/admin/organization-members', label: 'Miembros Org.',            icon: <Users size={20} />,        color: 'bg-amber-100 text-amber-600 border-amber-200', dot: 'bg-amber-400' },
  // Contenido
  { key: 'books',                route: '/admin/books-management',      label: 'Libros',                  icon: <BookOpen size={20} />,     color: 'bg-blue-100 text-blue-600 border-blue-200',    dot: 'bg-blue-500' },
  { key: 'book_categories',      route: '/admin/book-categories',      label: 'Categorías de Libros',     icon: <FolderTree size={20} />,   color: 'bg-yellow-100 text-yellow-600 border-yellow-200', dot: 'bg-yellow-400' },
  { key: 'book_levels',          route: '/admin/book-levels',          label: 'Niveles de Lectura',       icon: <Layers size={20} />,       color: 'bg-lime-100 text-lime-600 border-lime-200',    dot: 'bg-lime-400' },
  { key: 'book_genres',          route: '/admin/book-genres',          label: 'Géneros Literarios',       icon: <Sparkles size={20} />,     color: 'bg-purple-100 text-purple-600 border-purple-200', dot: 'bg-purple-400' },
  { key: 'book_tags',            route: '/admin/book-tags',            label: 'Etiquetas',                icon: <Tags size={20} />,         color: 'bg-rose-100 text-rose-600 border-rose-200',    dot: 'bg-rose-400' },
  { key: 'book_authors',         route: '/admin/book-authors',         label: 'Autores',                  icon: <UserPen size={20} />,      color: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200', dot: 'bg-fuchsia-400' },
  { key: 'book_pages',           route: '/admin/book-pages',           label: 'Páginas de Libros',        icon: <FileText size={20} />,     color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  // Interacción
  { key: 'book_reviews',         route: '/admin/book-reviews',         label: 'Reseñas',                  icon: <MessageSquare size={20} />,color: 'bg-cyan-100 text-cyan-600 border-cyan-200',    dot: 'bg-cyan-400' },
  { key: 'book_ratings',         route: '/admin/book-ratings',         label: 'Calificaciones',           icon: <Star size={20} />,         color: 'bg-yellow-100 text-yellow-600 border-yellow-200', dot: 'bg-yellow-400' },
  { key: 'reading_progress',     route: '/admin/reading-progress',     label: 'Progreso de Lectura',      icon: <TrendingUp size={20} />,   color: 'bg-green-100 text-green-600 border-green-200', dot: 'bg-green-400' },
  { key: 'reading_sessions',     route: '/admin/reading-sessions',     label: 'Sesiones de Lectura',      icon: <Clock size={20} />,        color: 'bg-indigo-100 text-indigo-600 border-indigo-200', dot: 'bg-indigo-400' },
  { key: 'favorites',            route: '/admin/favorites',            label: 'Favoritos',                icon: <Heart size={20} />,        color: 'bg-red-100 text-red-600 border-red-200',       dot: 'bg-red-400' },
  { key: 'reading_lists',        route: '/admin/reading-lists',        label: 'Listas de Lectura',        icon: <List size={20} />,         color: 'bg-violet-100 text-violet-600 border-violet-200', dot: 'bg-violet-400' },
  // Traducciones
  { key: 'translation_namespaces',route:'/admin/translation-namespaces',label:'Namespaces',              icon: <FolderTree size={20} />,   color: 'bg-pink-100 text-pink-600 border-pink-200',    dot: 'bg-pink-400' },
  { key: 'translation_categories',route:'/admin/translation-categories',label:'Categorías Traducción',   icon: <Tag size={20} />,          color: 'bg-orange-100 text-orange-600 border-orange-200', dot: 'bg-orange-400' },
  { key: 'translation_keys',     route: '/admin/translation-keys',     label: 'Claves de Traducción',     icon: <Key size={20} />,          color: 'bg-amber-100 text-amber-600 border-amber-200', dot: 'bg-amber-400' },
  { key: 'translations',         route: '/admin/translations',         label: 'Traducciones',             icon: <Languages size={20} />,    color: 'bg-teal-100 text-teal-600 border-teal-200',    dot: 'bg-teal-400' },
  // Sistema
  { key: 'languages',            route: '/admin/languages',            label: 'Idiomas',                  icon: <Globe size={20} />,        color: 'bg-sky-100 text-sky-600 border-sky-200',       dot: 'bg-sky-400' },
  { key: 'audit',                route: '/admin/audit',                label: 'Auditoría',                icon: <FileSearch size={20} />,   color: 'bg-gray-100 text-gray-600 border-gray-200',    dot: 'bg-gray-400' },
] as const;

const SECTIONS = [
  { title: '🔐 Acceso y Permisos',  keys: ['route_scanner','route_translations','roles','role_permissions','route_permissions','user_roles','user_permissions'] },
  { title: '👥 Usuarios',           keys: ['users','user_profiles','user_relationships','role_language_access'] },
  { title: '🏫 Organizaciones',     keys: ['organizations','organization_members'] },
  { title: '📚 Libros y Contenido', keys: ['books','book_categories','book_levels','book_genres','book_tags','book_authors','book_pages'] },
  { title: '💬 Interacción',        keys: ['book_reviews','book_ratings','reading_progress','reading_sessions','favorites','reading_lists'] },
  { title: '🌐 Traducciones',       keys: ['translation_namespaces','translation_categories','translation_keys','translations'] },
  { title: '⚙️ Sistema',            keys: ['languages','audit'] },
];

// ─────────────────────────────────────────────────────────────
// Tarjeta de módulo — mismo estilo cards login
// ─────────────────────────────────────────────────────────────
function ModuleCard({ moduleKey, index }: { moduleKey: string; index: number }) {
  const locale = useLocale();
  const mod = MODULES.find(m => m.key === moduleKey);
  if (!mod) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link href={`/${locale}${mod.route}`}>
        <div
          className={`flex items-center gap-3 p-3 rounded-2xl border-2 bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer ${mod.color}`}
        >
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${mod.color}`}>
            {mod.icon}
          </div>
          <span className="font-black text-sm leading-tight" style={{ fontFamily: FONT }}>
            {mod.label}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sección con título
// ─────────────────────────────────────────────────────────────
function Section({ title, keys }: { title: string; keys: readonly string[] }) {
  return (
    <div className="mb-6">
      <h2
        className="text-base font-black text-blue-800 mb-3 px-1"
        style={{ fontFamily: FONT }}
      >
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {keys.map((k, i) => (
          <ModuleCard key={k} moduleKey={k} index={i} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pasos del workflow — estilo tarjeta blanca borde amarillo
// ─────────────────────────────────────────────────────────────
const STEPS = [
  { n: '1', emoji: '🔍', title: 'Preparación',    desc: 'Escanea rutas · Configura traducciones de URLs',       color: 'text-blue-600' },
  { n: '2', emoji: '🛡️', title: 'Configuración',  desc: 'Define roles · Permisos · Control de acceso',          color: 'text-purple-600' },
  { n: '3', emoji: '👤', title: 'Asignación',     desc: 'Asigna roles a usuarios · Configura permisos finales', color: 'text-green-600' },
];

// ─────────────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  return (
    <UnifiedLayout
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-green-300"
      mainClassName="flex justify-center py-6 px-3 sm:px-6"
      backgroundComponent={<LoginBackground />}
    >
      <div className="relative z-20 w-full max-w-5xl">

        {/* ── Encabezado ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <div
            className="inline-flex items-center gap-2 bg-white/80 border-2 border-yellow-300 text-blue-700 text-sm font-black px-4 py-1.5 rounded-full mb-3 shadow-sm"
            style={{ fontFamily: FONT }}
          >
            <LayoutDashboard size={14} />
            Panel de Administración
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black text-white drop-shadow-md mb-1"
            style={{ fontFamily: FONT }}
          >
            Centro de Control 🎛️
          </h1>
          <p
            className="text-blue-100 font-bold text-sm"
            style={{ fontFamily: FONT }}
          >
            Gestiona todos los aspectos del sistema
          </p>
        </motion.div>

        {/* ── Workflow card — blanca con borde amarillo (igual que login) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl border-[3px] border-yellow-300 p-5 mb-6"
        >
          <h2
            className="text-sm font-black text-gray-600 uppercase tracking-wider mb-3"
            style={{ fontFamily: FONT }}
          >
            🎯 Flujo recomendado de configuración
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div
                  className={`w-8 h-8 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center font-black text-sm flex-shrink-0 ${s.color}`}
                  style={{ fontFamily: FONT }}
                >
                  {s.emoji}
                </div>
                <div>
                  <p className={`font-black text-sm ${s.color}`} style={{ fontFamily: FONT }}>{s.title}</p>
                  <p className="text-gray-500 text-xs font-bold leading-snug" style={{ fontFamily: FONT }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Grid de módulos — tarjeta blanca con borde amarillo ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl border-[3px] border-yellow-300 p-5 sm:p-6"
        >
          {SECTIONS.map((sec) => (
            <Section key={sec.title} title={sec.title} keys={sec.keys} />
          ))}
        </motion.div>

      </div>
    </UnifiedLayout>
  );
}

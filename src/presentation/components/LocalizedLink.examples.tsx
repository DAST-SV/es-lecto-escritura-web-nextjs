// ============================================
// src/presentation/components/LocalizedLink.examples.tsx
// EJEMPLOS DE USO - LocalizedLink y sistema de rutas traducidas
// ============================================

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  LocalizedLink,
  NavLink,
  ButtonLink,
  ConditionalLinks,
} from './LocalizedLink';
import { useLocalizedRoute, useLocalizedRoutes } from '@/src/presentation/hooks/useLocalizedRoute';
import { useRouteAccess, useMultipleRouteAccess } from '@/src/presentation/hooks/useRouteAccess';

// ============================================
// EJEMPLO 1: Link Simple con Traducción Automática
// ============================================
export function SimpleLink() {
  return (
    <LocalizedLink routeKey="admin.users">
      Admin Usuarios
    </LocalizedLink>
  );
  // Resultado:
  // - Español: <a href="/es/admin/usuarios">Admin Usuarios</a>
  // - Inglés:  <a href="/en/admin/users">Admin Usuarios</a>
  // - Francés: <a href="/fr/admin/utilisateurs">Admin Usuarios</a>
}

// ============================================
// EJEMPLO 2: Link con Parámetros Dinámicos
// ============================================
export function DynamicLink({ bookId }: { bookId: string }) {
  return (
    <LocalizedLink
      routeKey="books.edit"
      params={{ id: bookId }}
      className="text-blue-600 hover:underline"
    >
      Editar Libro
    </LocalizedLink>
  );
  // Resultado con bookId='123':
  // - Español: <a href="/es/libros/123/editar">Editar Libro</a>
  // - Inglés:  <a href="/en/books/123/edit">Editar Libro</a>
}

// ============================================
// EJEMPLO 3: Link con Verificación de Permisos
// ============================================
export function SecureLink() {
  return (
    <LocalizedLink
      routeKey="admin.roles"
      checkAccess
      loadingComponent={<span className="text-gray-400">Cargando...</span>}
      fallbackComponent={<span className="text-gray-400">Sin acceso</span>}
      className="text-blue-600 hover:underline"
    >
      Gestionar Roles
    </LocalizedLink>
  );
  // Si el usuario NO tiene acceso, muestra "Sin acceso"
  // Si el usuario SÍ tiene acceso, muestra el link normal
}

// ============================================
// EJEMPLO 4: NavLink para Menús de Navegación
// ============================================
export function NavigationMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4">
      <NavLink
        routeKey="admin.users"
        active={pathname.includes('/admin/usuarios')}
        activeClassName="bg-blue-600 text-white px-4 py-2 rounded"
        inactiveClassName="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded"
      >
        Usuarios
      </NavLink>

      <NavLink
        routeKey="admin.roles"
        active={pathname.includes('/admin/roles')}
        activeClassName="bg-blue-600 text-white px-4 py-2 rounded"
        inactiveClassName="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded"
      >
        Roles
      </NavLink>

      <NavLink
        routeKey="admin.audit"
        active={pathname.includes('/admin/auditoria')}
        activeClassName="bg-blue-600 text-white px-4 py-2 rounded"
        inactiveClassName="text-gray-700 hover:bg-gray-100 px-4 py-2 rounded"
      >
        Auditoría
      </NavLink>
    </nav>
  );
  // Los enlaces solo se muestran si el usuario tiene acceso
  // Los enlaces activos tienen estilos diferentes
}

// ============================================
// EJEMPLO 5: ButtonLink para Botones como Enlaces
// ============================================
export function ActionButtons() {
  return (
    <div className="flex gap-4">
      <ButtonLink
        routeKey="books.create"
        variant="primary"
        size="md"
      >
        Crear Libro
      </ButtonLink>

      <ButtonLink
        routeKey="admin.users"
        variant="outline"
        size="md"
      >
        Gestionar Usuarios
      </ButtonLink>

      <ButtonLink
        routeKey="books.trash"
        variant="danger"
        size="sm"
      >
        Papelera
      </ButtonLink>
    </div>
  );
  // Si el usuario no tiene acceso, muestra botones deshabilitados
}

// ============================================
// EJEMPLO 6: ConditionalLinks - Múltiples Enlaces
// ============================================
export function AdminBreadcrumb() {
  return (
    <ConditionalLinks
      links={[
        { key: 'home', label: 'Inicio' },
        { key: 'admin.dashboard', label: 'Admin' },
        { key: 'admin.users', label: 'Usuarios' },
      ]}
      className="flex gap-2 items-center"
      linkClassName="text-blue-600 hover:underline"
      separator={<span className="text-gray-400">/</span>}
    />
  );
  // Resultado:
  // Inicio / Admin / Usuarios
  // Solo muestra los enlaces a los que tiene acceso
}

// ============================================
// EJEMPLO 7: useLocalizedRoute - Obtener Rutas Manualmente
// ============================================
export function ManualRouteUsage() {
  // Obtener una sola ruta
  const adminUsersRoute = useLocalizedRoute('admin.users');
  console.log(adminUsersRoute); // '/es/admin/usuarios'

  // Obtener ruta con parámetros
  const bookEditRoute = useLocalizedRoute('books.edit', { id: '123' });
  console.log(bookEditRoute); // '/es/libros/123/editar'

  // Obtener múltiples rutas
  const routes = useLocalizedRoutes(['admin.users', 'admin.roles', 'admin.audit']);
  console.log(routes);
  // {
  //   'admin.users': '/es/admin/usuarios',
  //   'admin.roles': '/es/admin/roles',
  //   'admin.audit': '/es/admin/auditoria'
  // }

  return (
    <div>
      <p>Ruta de usuarios: {adminUsersRoute}</p>
      <p>Ruta de edición de libro: {bookEditRoute}</p>
    </div>
  );
}

// ============================================
// EJEMPLO 8: useRouteAccess - Verificar Permisos Manualmente
// ============================================
export function ConditionalContent() {
  const { canAccess, isLoading } = useRouteAccess('admin.users');

  if (isLoading) {
    return <div>Verificando permisos...</div>;
  }

  if (!canAccess) {
    return <div>No tienes acceso a la gestión de usuarios</div>;
  }

  return (
    <div>
      <h1>Gestión de Usuarios</h1>
      <p>Bienvenido al panel de administración</p>
    </div>
  );
}

// ============================================
// EJEMPLO 9: useMultipleRouteAccess - Verificar Múltiples Rutas
// ============================================
export function AdminSidebar() {
  const access = useMultipleRouteAccess([
    'admin.users',
    'admin.roles',
    'admin.translations',
    'admin.audit',
  ]);

  return (
    <aside className="w-64 bg-gray-100 p-4">
      <h2 className="text-xl font-bold mb-4">Panel de Admin</h2>
      <ul className="space-y-2">
        {access['admin.users'].canAccess && (
          <li>
            <LocalizedLink routeKey="admin.users" className="text-blue-600">
              Usuarios
            </LocalizedLink>
          </li>
        )}

        {access['admin.roles'].canAccess && (
          <li>
            <LocalizedLink routeKey="admin.roles" className="text-blue-600">
              Roles
            </LocalizedLink>
          </li>
        )}

        {access['admin.translations'].canAccess && (
          <li>
            <LocalizedLink routeKey="admin.translations" className="text-blue-600">
              Traducciones
            </LocalizedLink>
          </li>
        )}

        {access['admin.audit'].canAccess && (
          <li>
            <LocalizedLink routeKey="admin.audit" className="text-blue-600">
              Auditoría
            </LocalizedLink>
          </li>
        )}
      </ul>
    </aside>
  );
  // Solo muestra los items de menú a los que el usuario tiene acceso
}

// ============================================
// EJEMPLO 10: Card de Libro con Enlaces Condicionales
// ============================================
export function BookCard({ book }: { book: { id: string; title: string } }) {
  const readAccess = useRouteAccess('books.read', { id: book.id });
  const editAccess = useRouteAccess('books.edit', { id: book.id });

  return (
    <div className="border rounded-lg p-4 shadow">
      <h3 className="text-lg font-semibold mb-2">{book.title}</h3>

      <div className="flex gap-2 mt-4">
        {/* Siempre mostrar botón de lectura */}
        {!readAccess.isLoading && readAccess.canAccess && (
          <LocalizedLink
            routeKey="books.read"
            params={{ id: book.id }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Leer
          </LocalizedLink>
        )}

        {/* Solo mostrar botón de edición si tiene permisos */}
        {!editAccess.isLoading && editAccess.canAccess && (
          <LocalizedLink
            routeKey="books.edit"
            params={{ id: book.id }}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Editar
          </LocalizedLink>
        )}
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 11: Dropdown Menu con Enlaces Condicionales
// ============================================
export function AdminDropdown() {
  const [isOpen, setIsOpen] = React.useState(false);

  const adminLinks = [
    { key: 'admin.users' as const, label: 'Gestionar Usuarios', icon: '👥' },
    { key: 'admin.roles' as const, label: 'Gestionar Roles', icon: '🔐' },
    { key: 'admin.translations' as const, label: 'Traducciones', icon: '🌐' },
    { key: 'admin.audit' as const, label: 'Auditoría', icon: '📊' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Administración ▼
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border">
          <div className="py-1">
            {adminLinks.map((link) => (
              <NavLink
                key={link.key}
                routeKey={link.key}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// EJEMPLO 12: Tabla con Acciones Condicionales
// ============================================
export function UsersTable({ users }: { users: Array<{ id: string; name: string }> }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">ID</th>
          <th className="border p-2">Nombre</th>
          <th className="border p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="border p-2">{user.id}</td>
            <td className="border p-2">{user.name}</td>
            <td className="border p-2">
              <div className="flex gap-2">
                <NavLink
                  routeKey="admin.users"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver
                </NavLink>

                <NavLink
                  routeKey="admin.user-roles"
                  className="text-green-600 hover:underline text-sm"
                >
                  Roles
                </NavLink>

                <NavLink
                  routeKey="admin.user-permissions"
                  className="text-purple-600 hover:underline text-sm"
                >
                  Permisos
                </NavLink>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================
// EJEMPLO 13: Uso con Router para Redirecciones
// ============================================
export function LoginRedirect() {
  const router = useLocalizedRoute('auth.login');

  const handleUnauthorized = () => {
    // Redirigir al login con la ruta traducida
    window.location.href = router;
  };

  return (
    <button onClick={handleUnauthorized}>
      Ir al Login
    </button>
  );
}

// ============================================
// RESUMEN DE USO
// ============================================

/**
 * PASO 1: Agregar nuevas rutas a route-keys.config.ts
 *
 * export const ROUTE_KEYS = {
 *   'mi.nueva.ruta': '/mi/nueva/ruta',
 * }
 *
 * PASO 2: Agregar traducciones en Supabase
 *
 * INSERT INTO app.routes (pathname, display_name) VALUES ('/mi/nueva/ruta', 'Mi Nueva Ruta');
 * INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
 * VALUES (route_id, 'es', '/mi/nueva/ruta', 'Mi Nueva Ruta');
 *
 * PASO 3: Usar en componentes
 *
 * <LocalizedLink routeKey="mi.nueva.ruta" checkAccess>
 *   Mi Nueva Ruta
 * </LocalizedLink>
 */

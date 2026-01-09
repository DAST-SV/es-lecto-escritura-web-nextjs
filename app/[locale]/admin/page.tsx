/**
 * UBICACIÓN: app/[locale]/admin/page.tsx
 * 🏠 Dashboard con estadísticas completas trabajando directo con Supabase
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  BookOpen,
  Users,
  FileSearch,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  HardDrive,
  Activity,
  Eye,
  Trash2,
  BarChart3,
  BookMarked,
} from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface DashboardStats {
  // Libros
  totalBooks: number;
  activeBooks: number;
  deletedBooks: number;
  publishedBooks: number;
  featuredBooks: number;
  booksWithoutPDF: number;
  booksWithoutCover: number;
  
  // Usuarios y actividad
  totalUsers: number;
  recentActivity: number;
  
  // Estadísticas de lectura
  totalReadingSessions: number;
  totalReadingTime: number; // en segundos
  avgSessionDuration: number;
  mostReadBook: { id: string; title: string; sessions: number } | null;
  
  // Storage
  storageUsed: string;
  
  // Sistema
  lastAudit: string | null;
  systemHealth: 'healthy' | 'warning' | 'critical';
  orphanedFiles: number;
  brokenRelations: number;
}

interface RecentSession {
  id: string;
  book_title: string;
  user_email: string;
  start_time: string;
  duration: number;
  pages_read: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    activeBooks: 0,
    deletedBooks: 0,
    publishedBooks: 0,
    featuredBooks: 0,
    booksWithoutPDF: 0,
    booksWithoutCover: 0,
    totalUsers: 0,
    recentActivity: 0,
    totalReadingSessions: 0,
    totalReadingTime: 0,
    avgSessionDuration: 0,
    mostReadBook: null,
    storageUsed: '-',
    lastAudit: null,
    systemHealth: 'healthy',
    orphanedFiles: 0,
    brokenRelations: 0,
  });
  
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);

      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }

      // ============================================
      // 1. ESTADÍSTICAS DE LIBROS
      // ============================================
      const { data: books } = await supabase
        .from('books')
        .select('id, title, deleted_at, created_at, is_published, is_featured, pdf_url, cover_url');

      if (books) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const activeBooks = books.filter(b => !b.deleted_at);
        const deletedBooks = books.filter(b => b.deleted_at);

        setStats(prev => ({
          ...prev,
          totalBooks: books.length,
          activeBooks: activeBooks.length,
          deletedBooks: deletedBooks.length,
          publishedBooks: activeBooks.filter(b => b.is_published).length,
          featuredBooks: activeBooks.filter(b => b.is_featured).length,
          booksWithoutPDF: activeBooks.filter(b => !b.pdf_url).length,
          booksWithoutCover: activeBooks.filter(b => !b.cover_url).length,
          recentActivity: books.filter(b => new Date(b.created_at) > sevenDaysAgo).length,
        }));
      }

      // ============================================
      // 2. ESTADÍSTICAS DE USUARIOS
      // ============================================
      try {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (count !== null) {
          setStats(prev => ({ ...prev, totalUsers: count }));
        }
      } catch (err) {
        console.warn('No se pudieron cargar usuarios');
      }

      // ============================================
      // 3. ESTADÍSTICAS DE LECTURA
      // ============================================
      const { data: sessions } = await supabase
        .from('reading_sessions')
        .select('id, book_id, user_id, start_time, end_time, duration, pages_read');

      if (sessions) {
        const totalDuration = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const avgDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

        // Libro más leído
        const bookCounts = new Map<string, number>();
        sessions.forEach(s => {
          bookCounts.set(s.book_id, (bookCounts.get(s.book_id) || 0) + 1);
        });

        let mostReadBookId: string | null = null;
        let maxCount = 0;
        bookCounts.forEach((count, bookId) => {
          if (count > maxCount) {
            maxCount = count;
            mostReadBookId = bookId;
          }
        });

        let mostReadBook = null;
        if (mostReadBookId && books) {
          const book = books.find(b => b.id === mostReadBookId);
          if (book) {
            mostReadBook = {
              id: book.id,
              title: book.title || 'Sin título',
              sessions: maxCount,
            };
          }
        }

        setStats(prev => ({
          ...prev,
          totalReadingSessions: sessions.length,
          totalReadingTime: totalDuration,
          avgSessionDuration: avgDuration,
          mostReadBook,
        }));

        // Sesiones recientes (últimas 10)
        const { data: recentSessionsData } = await supabase
          .from('reading_sessions')
          .select(`
            id,
            start_time,
            duration,
            pages_read,
            book:books(title),
            user:profiles(email)
          `)
          .order('start_time', { ascending: false })
          .limit(10);

        if (recentSessionsData) {
          setRecentSessions(
            recentSessionsData.map((s: any) => ({
              id: s.id,
              book_title: s.book?.title || 'Desconocido',
              user_email: s.user?.email || 'Anónimo',
              start_time: s.start_time,
              duration: s.duration || 0,
              pages_read: s.pages_read || 0,
            }))
          );
        }
      }

      // ============================================
      // 4. CALCULAR SALUD DEL SISTEMA
      // ============================================
      const healthIssues = 
        stats.booksWithoutPDF + 
        stats.booksWithoutCover + 
        stats.orphanedFiles + 
        stats.brokenRelations;

      let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (healthIssues > 50) healthStatus = 'critical';
      else if (healthIssues > 10) healthStatus = 'warning';

      setStats(prev => ({ ...prev, systemHealth: healthStatus }));

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={24} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={24} className="text-yellow-600" />;
      case 'critical':
        return <AlertCircle size={24} className="text-red-600" />;
      default:
        return <Activity size={24} className="text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Vista general del sistema</p>
      </div>

      {/* System Health */}
      <div className={`border rounded-lg p-6 ${getHealthColor(stats.systemHealth)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getHealthIcon(stats.systemHealth)}
            <div>
              <h3 className="text-lg font-semibold">
                Estado del Sistema:{' '}
                {stats.systemHealth === 'healthy' && 'Saludable'}
                {stats.systemHealth === 'warning' && 'Requiere Atención'}
                {stats.systemHealth === 'critical' && 'Crítico'}
              </h3>
              <p className="text-sm mt-1">
                {stats.systemHealth === 'healthy' && 'Todo funcionando correctamente'}
                {stats.systemHealth === 'warning' && 'Hay elementos que requieren revisión'}
                {stats.systemHealth === 'critical' && 'Se requiere mantenimiento urgente'}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/${locale}/admin/audit`)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Ver Auditoría
          </button>
        </div>
      </div>

      {/* Stats Grid - Libros */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Estadísticas de Libros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Libros"
            value={stats.totalBooks}
            icon={<BookOpen size={24} className="text-blue-600" />}
            description={`${stats.activeBooks} activos`}
            color="blue"
          />

          <StatCard
            title="Publicados"
            value={stats.publishedBooks}
            icon={<CheckCircle size={24} className="text-green-600" />}
            description="Visibles públicamente"
            color="green"
          />

          <StatCard
            title="Destacados"
            value={stats.featuredBooks}
            icon={<BookMarked size={24} className="text-purple-600" />}
            description="En portada"
            color="purple"
          />

          <StatCard
            title="En Papelera"
            value={stats.deletedBooks}
            icon={<Trash2 size={24} className="text-orange-600" />}
            description="Pueden restaurarse"
            color="orange"
          />
        </div>
      </div>

      {/* Stats Grid - Lecturas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📖 Estadísticas de Lectura</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Sesiones Totales"
            value={stats.totalReadingSessions}
            icon={<Eye size={24} className="text-indigo-600" />}
            description="Lecturas registradas"
            color="indigo"
          />

          <StatCard
            title="Tiempo Total"
            value={formatDuration(stats.totalReadingTime)}
            icon={<Clock size={24} className="text-blue-600" />}
            description="De lectura"
            color="blue"
            isString
          />

          <StatCard
            title="Duración Promedio"
            value={formatDuration(Math.round(stats.avgSessionDuration))}
            icon={<TrendingUp size={24} className="text-green-600" />}
            description="Por sesión"
            color="green"
            isString
          />

          <StatCard
            title="Usuarios Activos"
            value={stats.totalUsers}
            icon={<Users size={24} className="text-purple-600" />}
            description="En el sistema"
            color="purple"
          />
        </div>
      </div>

      {/* Libro más leído */}
      {stats.mostReadBook && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <BookOpen className="text-indigo-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">📈 Libro Más Leído</h3>
              <p className="text-sm text-gray-600">El favorito de los usuarios</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-xl font-bold text-gray-900">{stats.mostReadBook.title}</p>
            <p className="text-sm text-gray-600 mt-1">
              {stats.mostReadBook.sessions} {stats.mostReadBook.sessions === 1 ? 'sesión' : 'sesiones'} de lectura
            </p>
          </div>
        </div>
      )}

      {/* Sesiones Recientes */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⏱️ Sesiones de Lectura Recientes</h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Libro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Páginas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {session.book_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.user_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(session.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.pages_read}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(session.start_time).toLocaleDateString('es-SV')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Alertas del Sistema */}
      {(stats.booksWithoutPDF > 0 || stats.booksWithoutCover > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
            <AlertCircle size={20} />
            Atención Requerida
          </h3>
          <div className="space-y-2">
            {stats.booksWithoutPDF > 0 && (
              <p className="text-sm text-amber-800">
                • {stats.booksWithoutPDF} {stats.booksWithoutPDF === 1 ? 'libro sin PDF' : 'libros sin PDF'}
              </p>
            )}
            {stats.booksWithoutCover > 0 && (
              <p className="text-sm text-amber-800">
                • {stats.booksWithoutCover} {stats.booksWithoutCover === 1 ? 'libro sin portada' : 'libros sin portada'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionCard
            title="Auditoría de Integridad"
            description="Verificar integridad de datos y archivos huérfanos"
            icon={<FileSearch size={20} />}
            onClick={() => router.push(`/${locale}/admin/audit`)}
            color="blue"
          />

          <ActionCard
            title="Gestión de Usuarios"
            description="Ver y administrar usuarios del sistema"
            icon={<Users size={20} />}
            onClick={() => router.push(`/${locale}/admin/users`)}
            color="purple"
            comingSoon
          />

          <ActionCard
            title="Analytics Avanzados"
            description="Estadísticas y reportes detallados"
            icon={<BarChart3 size={20} />}
            onClick={() => router.push(`/${locale}/admin/analytics`)}
            color="green"
            comingSoon
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'indigo';
  isString?: boolean;
}

function StatCard({ title, value, icon, description, color, isString }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    purple: 'bg-purple-50 border-purple-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className={`text-3xl font-bold text-gray-900 ${isString ? 'text-2xl' : ''}`}>
          {value}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'indigo' | 'pink';
  comingSoon?: boolean;
}

function ActionCard({ title, description, icon, onClick, color, comingSoon }: ActionCardProps) {
  const colorClasses = {
    blue: 'hover:border-blue-400 hover:bg-blue-50',
    green: 'hover:border-green-400 hover:bg-green-50',
    orange: 'hover:border-orange-400 hover:bg-orange-50',
    purple: 'hover:border-purple-400 hover:bg-purple-50',
    indigo: 'hover:border-indigo-400 hover:bg-indigo-50',
    pink: 'hover:border-pink-400 hover:bg-pink-50',
  };

  return (
    <button
      onClick={comingSoon ? undefined : onClick}
      disabled={comingSoon}
      className={`bg-white rounded-lg border border-gray-200 p-4 text-left transition-all ${
        comingSoon 
          ? 'opacity-50 cursor-not-allowed' 
          : `${colorClasses[color]} cursor-pointer`
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
            {comingSoon && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Próximamente
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
}
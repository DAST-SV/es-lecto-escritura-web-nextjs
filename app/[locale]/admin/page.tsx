/**
 * UBICACIÓN: app/[locale]/admin/page.tsx
 * 🏠 Dashboard principal del panel de administración
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
} from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';

interface DashboardStats {
  totalBooks: number;
  activeBooks: number;
  deletedBooks: number;
  totalUsers: number;
  recentActivity: number;
  storageUsed: string;
  lastAudit: string | null;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

export default function AdminDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    activeBooks: 0,
    deletedBooks: 0,
    totalUsers: 0,
    recentActivity: 0,
    storageUsed: '-',
    lastAudit: null,
    systemHealth: 'healthy',
  });
  
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

      // Obtener estadísticas de libros
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('id, deleted_at, created_at');

      if (!booksError && books) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setStats(prev => ({
          ...prev,
          totalBooks: books.length,
          activeBooks: books.filter(b => !b.deleted_at).length,
          deletedBooks: books.filter(b => b.deleted_at).length,
          recentActivity: books.filter(b => new Date(b.created_at) > sevenDaysAgo).length,
        }));
      }

      // Obtener estadísticas de usuarios (si tienes acceso)
      try {
        const { count, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (!usersError && count !== null) {
          setStats(prev => ({ ...prev, totalUsers: count }));
        }
      } catch (err) {
        console.warn('No se pudieron cargar usuarios');
      }

      // Calcular salud del sistema
      const healthStatus = calculateSystemHealth(
        stats.activeBooks,
        stats.deletedBooks
      );

      setStats(prev => ({ ...prev, systemHealth: healthStatus }));

    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSystemHealth = (
    active: number,
    deleted: number
  ): 'healthy' | 'warning' | 'critical' => {
    if (deleted === 0) return 'healthy';
    const ratio = deleted / (active + deleted);
    if (ratio > 0.3) return 'critical';
    if (ratio > 0.1) return 'warning';
    return 'healthy';
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Books */}
        <StatCard
          title="Total de Libros"
          value={stats.totalBooks}
          icon={<BookOpen size={24} className="text-blue-600" />}
          description={`${stats.activeBooks} activos`}
          color="blue"
        />

        {/* Active Books */}
        <StatCard
          title="Libros Activos"
          value={stats.activeBooks}
          icon={<CheckCircle size={24} className="text-green-600" />}
          description="Disponibles para lectura"
          color="green"
        />

        {/* Deleted Books */}
        <StatCard
          title="En Papelera"
          value={stats.deletedBooks}
          icon={<AlertCircle size={24} className="text-orange-600" />}
          description="Pueden restaurarse"
          color="orange"
        />

        {/* Recent Activity */}
        <StatCard
          title="Actividad Reciente"
          value={stats.recentActivity}
          icon={<Clock size={24} className="text-purple-600" />}
          description="Últimos 7 días"
          color="purple"
        />
      </div>

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
            title="Base de Datos"
            description="Mantenimiento y optimización de BD"
            icon={<Database size={20} />}
            onClick={() => router.push(`/${locale}/admin/database`)}
            color="green"
            comingSoon
          />

          <ActionCard
            title="Analytics"
            description="Estadísticas y reportes detallados"
            icon={<TrendingUp size={20} />}
            onClick={() => router.push(`/${locale}/admin/analytics`)}
            color="orange"
            comingSoon
          />

          <ActionCard
            title="Gestión de Libros"
            description="Administrar todos los libros del sistema"
            icon={<BookOpen size={20} />}
            onClick={() => router.push(`/${locale}/admin/books`)}
            color="indigo"
            comingSoon
          />

          <ActionCard
            title="Almacenamiento"
            description="Gestionar archivos y optimizar espacio"
            icon={<HardDrive size={20} />}
            onClick={() => router.push(`/${locale}/admin/storage`)}
            color="pink"
            comingSoon
          />
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Total de Libros" value={stats.totalBooks.toString()} />
          <InfoRow label="Libros Activos" value={stats.activeBooks.toString()} />
          <InfoRow label="En Papelera" value={stats.deletedBooks.toString()} />
          <InfoRow label="Usuarios" value={stats.totalUsers > 0 ? stats.totalUsers.toString() : 'N/A'} />
          <InfoRow label="Actividad (7 días)" value={stats.recentActivity.toString()} />
          <InfoRow label="Última Auditoría" value={stats.lastAudit || 'Nunca ejecutada'} />
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
  value: number;
  icon: React.ReactNode;
  description: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

function StatCard({ title, value, icon, description, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className="text-3xl font-bold text-gray-900">{value}</span>
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

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
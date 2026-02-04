// ============================================
// app/[locale]/admin/reading-sessions/page.tsx
// ✅ CRUD COMPLETO: Gestión de Sesiones de Lectura
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, Clock, Play } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useReadingSessionsManager } from '@/src/presentation/features/reading-sessions/hooks/useReadingSessionsManager';
import { ReadingSessionEntity } from '@/src/core/domain/entities/ReadingSessionEntity';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';

export default function ReadingSessionsPage() {
  const { sessions, loading, error, remove, refresh } = useReadingSessionsManager();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ReadingSessionEntity | null>(null);

  const handleDelete = async () => {
    if (!selectedSession) return;
    try { await remove(selectedSession.id); toast.success('Sesión eliminada'); setShowDeleteModal(false); setSelectedSession(null); }
    catch (err: any) { toast.error(err.message); }
  };

  const columns: Column<ReadingSessionEntity>[] = [
    { key: 'book', label: 'Libro', render: (item) => <span className="font-medium">{item.bookTitle || item.bookId.slice(0,8)}</span> },
    { key: 'user', label: 'Usuario', width: '150px', render: (item) => <span className="text-sm">{item.userName || item.userId.slice(0,8)}</span> },
    { key: 'pages', label: 'Páginas', width: '120px', align: 'center', render: (item) => <span className="text-sm">{item.startPage} → {item.endPage} ({item.pagesRead} págs)</span> },
    { key: 'duration', label: 'Duración', width: '100px', align: 'center', render: (item) => <span className="text-sm">{item.durationFormatted}</span> },
    { key: 'device', label: 'Dispositivo', width: '100px', align: 'center', render: (item) => <span className="text-lg">{item.deviceIcon}</span> },
    { key: 'language', label: 'Idioma', width: '80px', align: 'center', render: (item) => item.languageCode ? <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{item.languageCode.toUpperCase()}</span> : null },
    { key: 'status', label: 'Estado', width: '100px', align: 'center', render: (item) => item.isActive ? (
      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1 justify-center"><Play className="w-3 h-3" /> Activa</span>
    ) : <span className="text-slate-500 text-xs">Finalizada</span> },
    { key: 'date', label: 'Fecha', width: '120px', render: (item) => <span className="text-xs text-slate-500">{item.startedAt.toLocaleDateString()}</span> },
  ];

  if (loading && sessions.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 via-cyan-300 to-teal-300"><div className="text-center"><Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" /><p className="text-gray-600 font-medium">Cargando sesiones...</p></div></div></UnifiedLayout>);
  }

  if (error && sessions.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-400 via-red-300 to-orange-300"><AlertCircle size={64} className="text-red-500 mb-4" /><h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2><p className="text-gray-600 mb-6">{error}</p><button onClick={refresh} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Reintentar</button></div></UnifiedLayout>);
  }

  return (
    <UnifiedLayout brandName="Sesiones" backgroundComponent={<div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-400 via-cyan-300 to-teal-300" />} mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-blue-400 via-cyan-300 to-teal-300 p-2 sm:p-4 lg:p-6">
      <Toaster position="top-right" />
      <DataTable
        title="Sesiones de Lectura"
        data={sessions}
        columns={columns}
        onSearch={(term) => sessions.filter(s => s.bookTitle?.toLowerCase().includes(term.toLowerCase()) || s.userName?.toLowerCase().includes(term.toLowerCase()))}
        onDelete={(s) => { setSelectedSession(s); setShowDeleteModal(true); }}
        getItemKey={(item) => item.id}
      />
      <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedSession(null); }} onConfirm={async () => { await handleDelete(); }} title="Eliminar Sesión" itemName={selectedSession?.bookTitle || 'Sesión'} itemDetails={selectedSession ? [{ label: 'Páginas', value: `${selectedSession.pagesRead} leídas` }] : []} />
    </UnifiedLayout>
  );
}

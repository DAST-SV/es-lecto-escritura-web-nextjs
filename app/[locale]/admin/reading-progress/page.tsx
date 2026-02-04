// ============================================
// app/[locale]/admin/reading-progress/page.tsx
// ✅ CRUD COMPLETO: Gestión de Progreso de Lectura
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, BookOpen, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useReadingProgressManager } from '@/src/presentation/features/reading-progress/hooks/useReadingProgressManager';
import { ReadingProgressEntity } from '@/src/core/domain/entities/ReadingProgressEntity';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';

export default function ReadingProgressPage() {
  const { progress, loading, error, markCompleted, remove, refresh } = useReadingProgressManager();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState<ReadingProgressEntity | null>(null);

  const handleDelete = async () => {
    if (!selectedProgress) return;
    try { await remove(selectedProgress.id); toast.success('Progreso eliminado'); setShowDeleteModal(false); setSelectedProgress(null); }
    catch (err: any) { toast.error(err.message); }
  };

  const columns: Column<ReadingProgressEntity>[] = [
    { key: 'book', label: 'Libro', render: (item) => (
      <div className="flex items-center gap-2">
        {item.bookCover ? <img src={item.bookCover} className="w-8 h-12 rounded object-cover" /> : <BookOpen className="w-8 h-8 text-slate-400" />}
        <span className="font-medium">{item.bookTitle || item.bookId.slice(0,8)}</span>
      </div>
    )},
    { key: 'user', label: 'Usuario', width: '150px', render: (item) => <span className="text-sm">{item.userName || item.userId.slice(0,8)}</span> },
    { key: 'progress', label: 'Progreso', width: '150px', align: 'center', render: (item) => (
      <div className="flex flex-col items-center">
        <div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${item.completionPercentage}%` }} /></div>
        <span className="text-xs text-slate-600 mt-1">{item.progressDisplay}</span>
      </div>
    )},
    { key: 'page', label: 'Página', width: '100px', align: 'center', render: (item) => <span className="text-sm">{item.currentPage}</span> },
    { key: 'time', label: 'Tiempo', width: '100px', align: 'center', render: (item) => <span className="text-sm text-slate-500">{item.readingTimeFormatted}</span> },
    { key: 'completed', label: 'Completado', width: '100px', align: 'center', render: (item) => item.isCompleted ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <span className="text-slate-400">-</span> },
    { key: 'lastRead', label: 'Última lectura', width: '120px', render: (item) => <span className="text-xs text-slate-500">{item.lastReadAt.toLocaleDateString()}</span> },
  ];

  if (loading && progress.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex items-center justify-center bg-gradient-to-b from-green-400 via-emerald-300 to-teal-300"><div className="text-center"><Loader2 size={48} className="animate-spin text-green-600 mx-auto mb-4" /><p className="text-gray-600 font-medium">Cargando progreso...</p></div></div></UnifiedLayout>);
  }

  if (error && progress.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-400 via-red-300 to-orange-300"><AlertCircle size={64} className="text-red-500 mb-4" /><h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2><p className="text-gray-600 mb-6">{error}</p><button onClick={refresh} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Reintentar</button></div></UnifiedLayout>);
  }

  return (
    <UnifiedLayout brandName="Progreso" backgroundComponent={<div className="absolute inset-0 z-0 bg-gradient-to-b from-green-400 via-emerald-300 to-teal-300" />} mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-green-400 via-emerald-300 to-teal-300 p-2 sm:p-4 lg:p-6">
      <Toaster position="top-right" />
      <DataTable
        title="Progreso de Lectura"
        data={progress}
        columns={columns}
        onSearch={(term) => progress.filter(p => p.bookTitle?.toLowerCase().includes(term.toLowerCase()) || p.userName?.toLowerCase().includes(term.toLowerCase()))}
        onDelete={(p) => { setSelectedProgress(p); setShowDeleteModal(true); }}
        getItemKey={(item) => item.id}
        customActions={[
          { label: () => 'Marcar completo', onClick: async (item) => { await markCompleted(item.id); toast.success('Marcado como completo'); }, icon: () => '✅', show: (item) => !item.isCompleted },
        ]}
      />
      <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedProgress(null); }} onConfirm={async () => { await handleDelete(); }} title="Eliminar Progreso" itemName={selectedProgress?.bookTitle || 'Progreso'} itemDetails={selectedProgress ? [{ label: 'Progreso', value: selectedProgress.progressDisplay }] : []} />
    </UnifiedLayout>
  );
}

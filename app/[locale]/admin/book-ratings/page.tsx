// ============================================
// app/[locale]/admin/book-ratings/page.tsx
// ✅ CRUD COMPLETO: Gestión de Calificaciones
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, Star } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useBookRatingsManager } from '@/src/presentation/features/book-ratings/hooks/useBookRatingsManager';
import { BookRatingEntity } from '@/src/core/domain/entities/BookRatingEntity';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';

export default function BookRatingsPage() {
  const { ratings, loading, error, remove, refresh } = useBookRatingsManager();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState<BookRatingEntity | null>(null);

  const handleDelete = async () => {
    if (!selectedRating) return;
    try { await remove(selectedRating.id); toast.success('Calificación eliminada'); setShowDeleteModal(false); setSelectedRating(null); }
    catch (err: any) { toast.error(err.message); }
  };

  const columns: Column<BookRatingEntity>[] = [
    { key: 'rating', label: 'Calificación', width: '150px', align: 'center', render: (item) => (
      <div className="flex items-center justify-center gap-1">
        {[1,2,3,4,5].map(i => <Star key={i} className={`w-5 h-5 ${i <= item.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />)}
      </div>
    )},
    { key: 'book', label: 'Libro', render: (item) => <span className="font-medium">{item.bookTitle || item.bookId.slice(0,8)}</span> },
    { key: 'user', label: 'Usuario', width: '150px', render: (item) => <span className="text-sm text-slate-600">{item.userName || item.userId.slice(0,8)}</span> },
    { key: 'date', label: 'Fecha', width: '150px', render: (item) => <span className="text-sm text-slate-500">{item.createdAt.toLocaleDateString()}</span> },
  ];

  if (loading && ratings.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex items-center justify-center bg-gradient-to-b from-amber-400 via-yellow-300 to-orange-300"><div className="text-center"><Loader2 size={48} className="animate-spin text-amber-600 mx-auto mb-4" /><p className="text-gray-600 font-medium">Cargando calificaciones...</p></div></div></UnifiedLayout>);
  }

  if (error && ratings.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-400 via-red-300 to-orange-300"><AlertCircle size={64} className="text-red-500 mb-4" /><h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2><p className="text-gray-600 mb-6">{error}</p><button onClick={refresh} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Reintentar</button></div></UnifiedLayout>);
  }

  return (
    <UnifiedLayout brandName="Calificaciones" backgroundComponent={<div className="absolute inset-0 z-0 bg-gradient-to-b from-amber-400 via-yellow-300 to-orange-300" />} mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-amber-400 via-yellow-300 to-orange-300 p-2 sm:p-4 lg:p-6">
      <Toaster position="top-right" />
      <DataTable
        title="Calificaciones de Libros"
        data={ratings}
        columns={columns}
        onSearch={(term) => ratings.filter(r => r.bookTitle?.toLowerCase().includes(term.toLowerCase()) || r.userName?.toLowerCase().includes(term.toLowerCase()))}
        onDelete={(r) => { setSelectedRating(r); setShowDeleteModal(true); }}
        getItemKey={(item) => item.id}
      />
      <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedRating(null); }} onConfirm={async () => { await handleDelete(); }} title="Eliminar Calificación" itemName={`${selectedRating?.rating} estrellas`} itemDetails={selectedRating ? [{ label: 'Libro', value: selectedRating.bookTitle || 'N/A' }] : []} />
    </UnifiedLayout>
  );
}

// ============================================
// app/[locale]/admin/book-reviews/page.tsx
// ✅ CRUD COMPLETO: Gestión de Reseñas
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, MessageSquare, Check, X, Star } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useBookReviewsManager } from '@/src/presentation/features/book-reviews/hooks/useBookReviewsManager';
import { BookReviewEntity } from '@/src/core/domain/entities/BookReviewEntity';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';

export default function BookReviewsPage() {
  const { reviews, loading, error, approve, reject, feature, unfeature, softDelete, restore, hardDelete, refresh } = useBookReviewsManager();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<BookReviewEntity | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const handleDelete = async (hardDeleteOption: boolean) => {
    if (!selectedReview) return;
    try {
      if (hardDeleteOption) { await hardDelete(selectedReview.id); toast.success('Reseña eliminada permanentemente'); }
      else { await softDelete(selectedReview.id); toast.success('Reseña movida a la papelera'); }
      setShowDeleteModal(false); setSelectedReview(null);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleRestore = async (review: BookReviewEntity) => {
    try { await restore(review.id); toast.success('Reseña restaurada'); } catch (err: any) { toast.error(err.message); }
  };

  const columns: Column<BookReviewEntity>[] = [
    { key: 'content', label: 'Contenido', align: 'left', render: (item) => (
      <div className="max-w-md">
        {item.title && <p className="font-semibold text-slate-800">{item.title}</p>}
        <p className="text-sm text-slate-600 line-clamp-2">{item.content}</p>
      </div>
    )},
    { key: 'book', label: 'Libro', width: '150px', render: (item) => <span className="text-sm">{item.bookTitle || item.bookId.slice(0,8)}</span> },
    { key: 'helpful', label: 'Útil', width: '80px', align: 'center', render: (item) => <span className="text-sm">👍 {item.helpfulCount}</span> },
    { key: 'approved', label: 'Aprobada', width: '100px', align: 'center', render: (item) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {item.isApproved ? '✅ Sí' : '⏳ Pendiente'}
      </span>
    )},
    { key: 'featured', label: 'Destacada', width: '100px', align: 'center', render: (item) => item.isFeatured ? <Star className="w-5 h-5 text-amber-500 fill-amber-500 mx-auto" /> : null },
    { key: 'status', label: 'Estado', width: '100px', align: 'center', render: (item) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isDeleted ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
        {item.isDeleted ? '🗑️ Eliminado' : '✅ Activo'}
      </span>
    )},
  ];

  const filteredData = showTrash ? reviews.filter(r => r.isDeleted) : reviews.filter(r => !r.isDeleted);

  if (loading && reviews.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex items-center justify-center bg-gradient-to-b from-orange-400 via-amber-300 to-yellow-300"><div className="text-center"><Loader2 size={48} className="animate-spin text-orange-600 mx-auto mb-4" /><p className="text-gray-600 font-medium">Cargando reseñas...</p></div></div></UnifiedLayout>);
  }

  if (error && reviews.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-400 via-red-300 to-orange-300"><AlertCircle size={64} className="text-red-500 mb-4" /><h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2><p className="text-gray-600 mb-6">{error}</p><button onClick={refresh} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Reintentar</button></div></UnifiedLayout>);
  }

  return (
    <UnifiedLayout brandName="Reseñas" backgroundComponent={<div className="absolute inset-0 z-0 bg-gradient-to-b from-orange-400 via-amber-300 to-yellow-300" />} mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-orange-400 via-amber-300 to-yellow-300 p-2 sm:p-4 lg:p-6">
      <Toaster position="top-right" />
      <DataTable
        title={showTrash ? 'Reseñas Eliminadas' : 'Reseñas de Libros'}
        data={filteredData}
        columns={columns}
        onSearch={(term) => reviews.filter(r => r.content.toLowerCase().includes(term.toLowerCase()) || r.title?.toLowerCase().includes(term.toLowerCase()))}
        onDelete={(r) => { setSelectedReview(r); setShowDeleteModal(true); }}
        onRestore={handleRestore}
        getItemKey={(item) => item.id}
        isDeleted={(item) => item.isDeleted}
        showTrash={true}
        showingTrash={showTrash}
        onToggleTrash={() => setShowTrash(!showTrash)}
        customActions={[
          { label: (item) => item.isApproved ? 'Rechazar' : 'Aprobar', onClick: async (item) => { item.isApproved ? await reject(item.id) : await approve(item.id); toast.success(item.isApproved ? 'Reseña rechazada' : 'Reseña aprobada'); }, icon: (item) => item.isApproved ? '❌' : '✅', show: (item) => !item.isDeleted },
          { label: (item) => item.isFeatured ? 'Quitar destacado' : 'Destacar', onClick: async (item) => { item.isFeatured ? await unfeature(item.id) : await feature(item.id); toast.success(item.isFeatured ? 'Destacado removido' : 'Reseña destacada'); }, icon: () => '⭐', show: (item) => !item.isDeleted && item.isApproved },
        ]}
      />
      <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedReview(null); }} onConfirm={handleDelete} title="Eliminar Reseña" itemName={selectedReview?.title || 'Reseña'} itemDetails={selectedReview ? [{ label: 'Usuario', value: selectedReview.userId.slice(0,8) }] : []} showHardDeleteOption={selectedReview?.isDeleted || false} />
    </UnifiedLayout>
  );
}

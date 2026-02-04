// ============================================
// app/[locale]/admin/favorites/page.tsx
// ✅ CRUD COMPLETO: Gestión de Favoritos
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, Heart, BookOpen } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useFavoritesManager } from '@/src/presentation/features/favorites/hooks/useFavoritesManager';
import { FavoriteEntity } from '@/src/core/domain/entities/FavoriteEntity';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';

export default function FavoritesPage() {
  const { favorites, loading, error, remove, refresh } = useFavoritesManager();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteEntity | null>(null);

  const handleDelete = async () => {
    if (!selectedFavorite) return;
    try { await remove(selectedFavorite.id); toast.success('Favorito eliminado'); setShowDeleteModal(false); setSelectedFavorite(null); }
    catch (err: any) { toast.error(err.message); }
  };

  const columns: Column<FavoriteEntity>[] = [
    { key: 'book', label: 'Libro', render: (item) => (
      <div className="flex items-center gap-3">
        {item.bookCover ? <img src={item.bookCover} className="w-10 h-14 rounded object-cover shadow" /> : <div className="w-10 h-14 bg-pink-100 rounded flex items-center justify-center"><BookOpen className="w-5 h-5 text-pink-500" /></div>}
        <span className="font-medium">{item.bookTitle || item.bookId.slice(0,8)}</span>
      </div>
    )},
    { key: 'user', label: 'Usuario', width: '200px', render: (item) => <span className="text-sm text-slate-600">{item.userName || item.userId.slice(0,8)}</span> },
    { key: 'date', label: 'Agregado', width: '150px', render: (item) => <span className="text-sm text-slate-500">{item.createdAt.toLocaleDateString()}</span> },
    { key: 'icon', label: '', width: '50px', align: 'center', render: () => <Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> },
  ];

  if (loading && favorites.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex items-center justify-center bg-gradient-to-b from-pink-400 via-rose-300 to-red-300"><div className="text-center"><Loader2 size={48} className="animate-spin text-pink-600 mx-auto mb-4" /><p className="text-gray-600 font-medium">Cargando favoritos...</p></div></div></UnifiedLayout>);
  }

  if (error && favorites.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-400 via-red-300 to-orange-300"><AlertCircle size={64} className="text-red-500 mb-4" /><h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2><p className="text-gray-600 mb-6">{error}</p><button onClick={refresh} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Reintentar</button></div></UnifiedLayout>);
  }

  return (
    <UnifiedLayout brandName="Favoritos" backgroundComponent={<div className="absolute inset-0 z-0 bg-gradient-to-b from-pink-400 via-rose-300 to-red-300" />} mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-pink-400 via-rose-300 to-red-300 p-2 sm:p-4 lg:p-6">
      <Toaster position="top-right" />
      <DataTable
        title="Libros Favoritos"
        data={favorites}
        columns={columns}
        onSearch={(term) => favorites.filter(f => f.bookTitle?.toLowerCase().includes(term.toLowerCase()) || f.userName?.toLowerCase().includes(term.toLowerCase()))}
        onDelete={(f) => { setSelectedFavorite(f); setShowDeleteModal(true); }}
        getItemKey={(item) => item.id}
      />
      <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedFavorite(null); }} onConfirm={async () => { await handleDelete(); }} title="Quitar de Favoritos" itemName={selectedFavorite?.bookTitle || 'Favorito'} itemDetails={selectedFavorite ? [{ label: 'Usuario', value: selectedFavorite.userName || 'N/A' }] : []} />
    </UnifiedLayout>
  );
}

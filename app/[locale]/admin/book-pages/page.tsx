// ============================================
// app/[locale]/admin/book-pages/page.tsx
// ✅ CRUD COMPLETO: Gestión de Páginas de Libros
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, FileText, Image, Volume2, Gamepad2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useBookPagesManager } from '@/src/presentation/features/book-pages/hooks/useBookPagesManager';
import { BookPageEntity } from '@/src/core/domain/entities/BookPageEntity';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';

export default function BookPagesPage() {
  const { pages, loading, error, remove, refresh } = useBookPagesManager();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<BookPageEntity | null>(null);

  const handleDelete = async () => {
    if (!selectedPage) return;
    try { await remove(selectedPage.id); toast.success('Página eliminada'); setShowDeleteModal(false); setSelectedPage(null); }
    catch (err: any) { toast.error(err.message); }
  };

  const columns: Column<BookPageEntity>[] = [
    { key: 'page', label: '#', width: '60px', align: 'center', render: (item) => <span className="font-bold text-lg text-slate-700">{item.pageNumber}</span> },
    { key: 'book', label: 'Libro', width: '200px', render: (item) => <span className="font-medium">{item.bookTitle || item.bookId.slice(0,8)}</span> },
    { key: 'content', label: 'Contenido', render: (item) => (
      <p className="text-sm text-slate-600 line-clamp-2">{item.getContent('es') || 'Sin contenido'}</p>
    )},
    { key: 'media', label: 'Medios', width: '120px', align: 'center', render: (item) => (
      <div className="flex items-center justify-center gap-2">
        {item.imageUrl && <Image className="w-4 h-4 text-blue-500" />}
        {item.audioUrl && <Volume2 className="w-4 h-4 text-green-500" />}
        {item.hasInteraction && <Gamepad2 className="w-4 h-4 text-purple-500" />}
      </div>
    )},
    { key: 'interaction', label: 'Interacción', width: '100px', align: 'center', render: (item) => item.hasInteraction ? (
      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{item.interactionIcon} {item.interactionType}</span>
    ) : <span className="text-slate-400">-</span> },
    { key: 'translations', label: 'Idiomas', width: '120px', align: 'center', render: (item) => (
      <div className="flex items-center justify-center gap-1">
        {item.translations.slice(0, 3).map(t => (
          <span key={t.languageCode} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{t.languageCode.toUpperCase()}</span>
        ))}
        {item.translations.length > 3 && <span className="text-xs text-slate-500">+{item.translations.length - 3}</span>}
      </div>
    )},
  ];

  if (loading && pages.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex items-center justify-center bg-gradient-to-b from-slate-400 via-gray-300 to-zinc-300"><div className="text-center"><Loader2 size={48} className="animate-spin text-slate-600 mx-auto mb-4" /><p className="text-gray-600 font-medium">Cargando páginas...</p></div></div></UnifiedLayout>);
  }

  if (error && pages.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-400 via-red-300 to-orange-300"><AlertCircle size={64} className="text-red-500 mb-4" /><h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2><p className="text-gray-600 mb-6">{error}</p><button onClick={refresh} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Reintentar</button></div></UnifiedLayout>);
  }

  return (
    <UnifiedLayout brandName="Páginas" backgroundComponent={<div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-400 via-gray-300 to-zinc-300" />} mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-slate-400 via-gray-300 to-zinc-300 p-2 sm:p-4 lg:p-6">
      <Toaster position="top-right" />
      <DataTable
        title="Páginas de Libros"
        data={pages}
        columns={columns}
        onSearch={(term) => pages.filter(p => p.bookTitle?.toLowerCase().includes(term.toLowerCase()) || p.getContent('es').toLowerCase().includes(term.toLowerCase()))}
        onDelete={(p) => { setSelectedPage(p); setShowDeleteModal(true); }}
        getItemKey={(item) => item.id}
      />
      <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedPage(null); }} onConfirm={async () => { await handleDelete(); }} title="Eliminar Página" itemName={`Página ${selectedPage?.pageNumber}`} itemDetails={selectedPage ? [{ label: 'Libro', value: selectedPage.bookTitle || 'N/A' }] : []} />
    </UnifiedLayout>
  );
}

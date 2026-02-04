// ============================================
// app/[locale]/admin/reading-lists/page.tsx
// ✅ CRUD COMPLETO: Gestión de Listas de Lectura
// ============================================

'use client';

import React, { useState } from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { DataTable, Column } from '@/src/presentation/components/shared/DataTable';
import { Loader2, AlertCircle, List, Globe, Lock, BookOpen } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useReadingListsManager } from '@/src/presentation/features/reading-lists/hooks/useReadingListsManager';
import { ReadingListEntity } from '@/src/core/domain/entities/ReadingListEntity';
import { EditModal } from '@/src/presentation/components/shared/Modals/EditModal';
import { DeleteConfirmModal } from '@/src/presentation/components/shared/Modals/DeleteConfirmModal';

export default function ReadingListsPage() {
  const { lists, loading, error, create, update, softDelete, restore, hardDelete, refresh } = useReadingListsManager();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedList, setSelectedList] = useState<ReadingListEntity | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  const handleCreate = async (data: Record<string, any>) => {
    try { await create({ userId: data.userId, name: data.name, description: data.description || null, isPublic: data.isPublic === 'true' }); toast.success('Lista creada'); setShowCreateModal(false); }
    catch (err: any) { toast.error(err.message); throw err; }
  };

  const handleUpdate = async (data: Record<string, any>) => {
    if (!selectedList) return;
    try { await update(selectedList.id, { name: data.name, description: data.description || null, isPublic: data.isPublic === 'true' }); toast.success('Lista actualizada'); setShowEditModal(false); setSelectedList(null); }
    catch (err: any) { toast.error(err.message); throw err; }
  };

  const handleDelete = async (hardDeleteOption: boolean) => {
    if (!selectedList) return;
    try {
      if (hardDeleteOption) { await hardDelete(selectedList.id); toast.success('Lista eliminada permanentemente'); }
      else { await softDelete(selectedList.id); toast.success('Lista movida a la papelera'); }
      setShowDeleteModal(false); setSelectedList(null);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleRestore = async (list: ReadingListEntity) => {
    try { await restore(list.id); toast.success('Lista restaurada'); } catch (err: any) { toast.error(err.message); }
  };

  const columns: Column<ReadingListEntity>[] = [
    { key: 'name', label: 'Nombre', render: (item) => (
      <div className="flex items-center gap-2">
        <List className="w-5 h-5 text-indigo-500" />
        <div>
          <span className="font-semibold text-slate-800">{item.name}</span>
          {item.description && <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>}
        </div>
      </div>
    )},
    { key: 'user', label: 'Usuario', width: '150px', render: (item) => <span className="text-sm">{item.userName || item.userId.slice(0,8)}</span> },
    { key: 'books', label: 'Libros', width: '100px', align: 'center', render: (item) => <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-sm font-medium">{item.bookCount || 0}</span> },
    { key: 'visibility', label: 'Visibilidad', width: '100px', align: 'center', render: (item) => item.isPublic ? <Globe className="w-5 h-5 text-green-500 mx-auto" /> : <Lock className="w-5 h-5 text-slate-400 mx-auto" /> },
    { key: 'status', label: 'Estado', width: '100px', align: 'center', render: (item) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.isDeleted ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
        {item.isDeleted ? '🗑️ Eliminado' : '✅ Activo'}
      </span>
    )},
  ];

  const createFields = [
    { name: 'userId', label: 'ID Usuario', type: 'text' as const, value: '', required: true },
    { name: 'name', label: 'Nombre', type: 'text' as const, value: '', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' as const, value: '' },
    { name: 'isPublic', label: 'Visibilidad', type: 'select' as const, value: 'false', options: [{ value: 'false', label: 'Privada' }, { value: 'true', label: 'Pública' }] },
  ];

  const editFields = selectedList ? [
    { name: 'name', label: 'Nombre', type: 'text' as const, value: selectedList.name, required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' as const, value: selectedList.description || '' },
    { name: 'isPublic', label: 'Visibilidad', type: 'select' as const, value: selectedList.isPublic ? 'true' : 'false', options: [{ value: 'false', label: 'Privada' }, { value: 'true', label: 'Pública' }] },
  ] : [];

  const filteredData = showTrash ? lists.filter(l => l.isDeleted) : lists.filter(l => !l.isDeleted);

  if (loading && lists.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex items-center justify-center bg-gradient-to-b from-indigo-400 via-purple-300 to-violet-300"><div className="text-center"><Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" /><p className="text-gray-600 font-medium">Cargando listas...</p></div></div></UnifiedLayout>);
  }

  if (error && lists.length === 0) {
    return (<UnifiedLayout showNavbar={true}><div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-400 via-red-300 to-orange-300"><AlertCircle size={64} className="text-red-500 mb-4" /><h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2><p className="text-gray-600 mb-6">{error}</p><button onClick={refresh} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">Reintentar</button></div></UnifiedLayout>);
  }

  return (
    <UnifiedLayout brandName="Listas" backgroundComponent={<div className="absolute inset-0 z-0 bg-gradient-to-b from-indigo-400 via-purple-300 to-violet-300" />} mainClassName="h-full w-full flex flex-col bg-gradient-to-b from-indigo-400 via-purple-300 to-violet-300 p-2 sm:p-4 lg:p-6">
      <Toaster position="top-right" />
      <DataTable
        title={showTrash ? 'Listas Eliminadas' : 'Listas de Lectura'}
        data={filteredData}
        columns={columns}
        onSearch={(term) => lists.filter(l => l.name.toLowerCase().includes(term.toLowerCase()))}
        onEdit={(l) => { setSelectedList(l); setShowEditModal(true); }}
        onDelete={(l) => { setSelectedList(l); setShowDeleteModal(true); }}
        onCreate={() => setShowCreateModal(true)}
        onRestore={handleRestore}
        getItemKey={(item) => item.id}
        isDeleted={(item) => item.isDeleted}
        showTrash={true}
        showingTrash={showTrash}
        onToggleTrash={() => setShowTrash(!showTrash)}
        createButtonText="Nueva Lista"
      />
      <EditModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreate} title="Crear Lista" fields={createFields} submitButtonText="Crear" submitButtonColor="green" />
      <EditModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedList(null); }} onSubmit={handleUpdate} title="Editar Lista" fields={editFields} submitButtonText="Actualizar" submitButtonColor="amber" />
      <DeleteConfirmModal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedList(null); }} onConfirm={handleDelete} title="Eliminar Lista" itemName={selectedList?.name || ''} itemDetails={selectedList ? [{ label: 'Libros', value: `${selectedList.bookCount || 0}` }] : []} showHardDeleteOption={selectedList?.isDeleted || false} />
    </UnifiedLayout>
  );
}

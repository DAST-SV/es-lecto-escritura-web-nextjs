'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, FileEdit, Eye, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import WordEditor from './WordEditor';
import FlipBook from '@/src/components/components-for-books/book/utils/FlipBook';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

interface Page {
  layout: string;
  title: string;
  text: string;
  image?: string | null;
  background?: string | null;
  id?: string;
}

interface BookEditorWithPreviewProps {
  initialPages?: Page[];
  bookTitle?: string;
  IdLibro: string;
  saveEndpoint?: string;
}

export const BookEditorWithPreview: React.FC<BookEditorWithPreviewProps> = ({
  initialPages = [],
  bookTitle = 'Mi Libro',
  IdLibro,
  saveEndpoint = '/api/libros/updatebook/'
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [editorKey, setEditorKey] = useState(0);

  // Sincronizar páginas desde el editor
  const handlePagesUpdate = (updatedPages: any[]) => {
    const formattedPages = updatedPages.map(page => ({
      layout: 'TextCenterLayout',
      title: '',
      text: page.content || page.text || '',
      image: page.image || null,
      background: page.background || null,
      id: page.id || `page-${Date.now()}`
    }));
    
    setPages(formattedPages);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch(saveEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idLibro: IdLibro,
          pages: pages
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar');
      }
      
      toast.success('📚 Libro guardado correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('❌ Error al guardar el libro');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setActiveTab('preview');
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <UnifiedLayout mainClassName="pt-0">
      <div className="h-screen flex flex-col bg-gray-50">
        <Toaster position="bottom-center" />

        {/* Header único unificado */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
          <div className="px-4 py-2 flex items-center justify-between gap-4">
            
            {/* Logo + Título */}
            <div className="flex items-center gap-2 min-w-[150px]">
              <BookOpen size={18} className="flex-shrink-0" />
              <span className="font-semibold text-sm truncate">{bookTitle}</span>
            </div>

            {/* Navegación de páginas */}
            <div className="flex items-center gap-1 bg-white/20 rounded px-2 py-1">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-medium px-1.5 min-w-[40px] text-center">
                {currentPage + 1} / {pages.length || 1}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage >= pages.length - 1}
                className="p-0.5 hover:bg-white/20 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/10 rounded-md p-0.5">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  activeTab === 'editor'
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <FileEdit size={14} />
                <span>Editor</span>
              </button>
              
              <button
                onClick={handlePreview}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-purple-600 shadow'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <Eye size={14} />
                <span>Vista Previa</span>
              </button>
            </div>

            {/* Info + Guardar */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs bg-white/10 rounded px-2 py-1">
                <span className="opacity-80">Total:</span>
                <span className="font-bold">{pages.length || 0}</span>
              </div>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} className={isSaving ? 'animate-pulse' : ''} />
                <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'editor' ? (
            <WordEditor
              key={editorKey}
              initialPages={pages.map(p => ({
                id: p.id,
                content: p.text,
                image: p.image,
                background: p.background
              }))}
              bookTitle={bookTitle}
              onPageChange={handlePageChange}
              hideHeader={true}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              {pages.length > 0 ? (
                <FlipBook 
                  pages={pages}
                  width={600}
                  height={700}
                />
              ) : (
                <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-sm">
                  <BookOpen size={48} className="mx-auto mb-3 text-gray-400" />
                  <h3 className="text-lg font-bold text-gray-700 mb-2">
                    No hay contenido
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Crea páginas en el editor para previsualizar
                  </p>
                  <button
                    onClick={() => setActiveTab('editor')}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Ir al Editor
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 text-white px-4 py-1.5 text-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>💡 Editor profesional de libros</span>
            <span>⌨️ <strong>Ctrl+B</strong> Negrita</span>
            <span>⌨️ <strong>Ctrl+I</strong> Cursiva</span>
            <span>⌨️ <strong>Ctrl+Z</strong> Deshacer</span>
          </div>
          <span className="font-medium">
            {activeTab === 'editor' ? '📝 Editando' : '👀 Previsualizando'}
          </span>
        </div>
      </div>
    </UnifiedLayout>
  );
};
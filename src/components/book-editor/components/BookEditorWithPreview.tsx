'use client';

import React, { useState, useRef } from 'react';
import { BookOpen, FileEdit, Eye, Save } from 'lucide-react';
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
  IdLibro?: string;
  onSave?: (pages: Page[]) => Promise<void>;
}

export const BookEditorWithPreview: React.FC<BookEditorWithPreviewProps> = ({
  initialPages = [],
  bookTitle = 'Mi Libro',
  IdLibro,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [isSaving, setIsSaving] = useState(false);

  const handlePagesUpdate = (updatedPages: Page[]) => {
    setPages(updatedPages);
  };

  const handleSave = async (editorPages: Page[]) => {
    setIsSaving(true);
    
    try {
      // Actualizar estado local
      setPages(editorPages);
      
      // Llamar callback de guardado si existe
      if (onSave) {
        await onSave(editorPages);
      } else {
        // Guardado por defecto
        const response = await fetch('/api/libros/updatebook/', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idLibro: IdLibro,
            pages: editorPages
          })
        });

        if (!response.ok) {
          throw new Error('Error al guardar');
        }
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

  return (
    <UnifiedLayout mainClassName="pt-0">
      <div className="h-screen flex flex-col bg-gray-50">
        <Toaster position="bottom-center" />

        {/* Header con tabs */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BookOpen size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{bookTitle}</h1>
                <p className="text-sm opacity-90">Editor profesional tipo Word</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'editor'
                    ? 'bg-white text-blue-600 shadow-lg scale-105'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FileEdit size={20} />
                <span>Editor</span>
              </button>
              
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-purple-600 shadow-lg scale-105'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Eye size={20} />
                <span>Vista Previa</span>
              </button>
            </div>

            {/* Info adicional */}
            <div className="flex items-center gap-4 bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xs opacity-80">Total páginas</div>
                <div className="text-2xl font-bold">{pages.length}</div>
              </div>
              {isSaving && (
                <div className="flex items-center gap-2 text-sm">
                  <Save size={16} className="animate-pulse" />
                  <span>Guardando...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'editor' ? (
            <WordEditor
              initialPages={pages}
              bookTitle={bookTitle}
              onSave={handleSave}
              onPreview={handlePreview}
            />
          ) : (
            <div className="h-full w-full relative">
              {/* Botón para volver al editor */}
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setActiveTab('editor')}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all border-2 border-blue-500 text-blue-600 font-medium"
                >
                  <FileEdit size={18} />
                  <span>Volver al Editor</span>
                </button>
              </div>

              {/* Vista previa con FlipBook */}
              {pages.length > 0 ? (
                <FlipBook 
                  pages={pages as any}
                  width={600}
                  height={700}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      No hay contenido para previsualizar
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Escribe algo en el editor para ver la vista previa
                    </p>
                    <button
                      onClick={() => setActiveTab('editor')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ir al Editor
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con ayuda */}
        <div className="bg-gray-800 text-white px-6 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span>💡 <strong>Tip:</strong> El texto se pagina automáticamente como en Word</span>
            <span>⌨️ <strong>Ctrl+B:</strong> Negrita</span>
            <span>⌨️ <strong>Ctrl+I:</strong> Cursiva</span>
            <span>⌨️ <strong>Ctrl+U:</strong> Subrayado</span>
            <span>⌨️ <strong>Ctrl+Z:</strong> Deshacer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-70">Modo:</span>
            <span className="font-bold">
              {activeTab === 'editor' ? '📝 Editando' : '👀 Previsualizando'}
            </span>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};
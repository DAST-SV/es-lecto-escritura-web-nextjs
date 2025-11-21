'use client';

import React, { useState, useCallback } from 'react';
import { WordEditor } from './WordEditor';
import CustomFlipBook from './CustomFlipBook';
import { Book, Eye, Edit3, Save } from 'lucide-react';

interface Page {
  id: string;
  content: string;
  image?: string | null;
  background?: string | null;
}

interface BookEditorWithPreviewProps {
  initialPages?: Page[];
  bookTitle?: string;
  onSave?: (pages: Page[]) => Promise<void>;
}

export const BookEditorWithPreview: React.FC<BookEditorWithPreviewProps> = ({
  initialPages = [],
  bookTitle = 'Mi Libro',
  onSave
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [isSaving, setIsSaving] = useState(false);

  // Manejar cambios en las páginas desde el editor
  const handlePagesChange = useCallback((updatedPages: Page[]) => {
    setPages(updatedPages);
  }, []);

  // Guardar el libro
  const handleSave = useCallback(async () => {
    if (!onSave || isSaving) return;
    
    try {
      setIsSaving(true);
      await onSave(pages);
      alert('✅ Libro guardado correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('❌ Error al guardar el libro');
    } finally {
      setIsSaving(false);
    }
  }, [pages, onSave, isSaving]);

  // Vista de edición
  if (mode === 'edit') {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Book className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-gray-800">{bookTitle}</h1>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              {pages.length} {pages.length === 1 ? 'página' : 'páginas'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {onSave && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            )}
            <button
              onClick={() => setMode('preview')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
            >
              <Eye size={18} />
              Vista Previa
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <WordEditor 
            initialPages={pages}
            onPageChange={() => {}}
            onPagesUpdate={handlePagesChange}
          />
        </div>
      </div>
    );
  }

  // Vista de preview (FlipBook)
  return (
    <CustomFlipBook
      pages={pages}
      bookTitle={bookTitle}
      onClose={() => setMode('edit')}
      showCover={true}
    />
  );
};

export default BookEditorWithPreview;
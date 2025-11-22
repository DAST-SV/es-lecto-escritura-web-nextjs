/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/BookEditor.tsx
 * 
 * Editor completo de libro con título y contenido
 */

'use client';

import { RichTextEditor } from "../../../editor/components/RichTextEditor/RichTextEditor";
import { TitleEditor } from "../../../editor/components/RichTextEditor/TitleEditor";
import { useEditor } from "../../../editor/hooks/useEditor";
import { useCreateBook } from "../../hooks/useCreateBook";

// import { RichTextEditor } from '@/src/presentation/features/editor/components/RichTextEditor';
// import { TitleEditor } from '@/presentation/features/editor/components/TitleEditor';
// import { useEditor } from '@/presentation/features/editor/hooks/useEditor';
// import { useCreateBook } from '@/presentation/features/books/hooks/useCreateBook';

export function BookEditor() {
  const editor = useEditor({
    titleLimit: 150,
    contentLimit: 650,
  });

  const { createBook, isCreating } = useCreateBook();

  const handleSave = async () => {
    const result = await createBook({
      title: editor.title,
      content: editor.content,
    });

    if (result.success) {
      // Redirigir o mostrar mensaje
      console.log('Libro creado exitosamente');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Título del Libro
          {editor.isDirty && (
            <span className="ml-2 text-orange-500 text-xs">Sin guardar</span>
          )}
        </label>
        <TitleEditor
          value={editor.title}
          onChange={editor.setTitle}
          characterLimit={editor.titleLimit}
        />
      </div>

      {/* Contenido */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Contenido del Libro
        </label>
        <RichTextEditor
          value={editor.content}
          onChange={editor.setContent}
          characterLimit={editor.contentLimit}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!editor.isValid || isCreating}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Guardando...' : 'Crear Libro'}
        </button>

        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
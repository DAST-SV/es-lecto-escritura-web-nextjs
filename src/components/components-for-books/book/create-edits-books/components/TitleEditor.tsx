import React from 'react';

interface TitleEditorProps {
  isEditing: boolean;
  currentTitle: string;
  editingTitle: string;
  pageNumber: number;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTitleChange: (value: string) => void;
}

export const TitleEditor: React.FC<TitleEditorProps> = ({
  isEditing,
  currentTitle,
  editingTitle,
  pageNumber,
  onStartEdit,
  onSave,
  onCancel,
  onTitleChange
}) => {
  return (
    <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
      <label className="block text-sm font-bold text-gray-700 mb-3">
        📝 Título de página {pageNumber}:
      </label>

      {isEditing ? (
        <>
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full p-3 border-2 border-yellow-300 rounded-lg focus:outline-none focus:border-yellow-500 text-gray-900"
            placeholder="Escribe el título aquí..."
            autoFocus
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={onSave}
              className="flex-1 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              ✅ Guardar
            </button>
            <button
              onClick={onCancel}
              className="flex-1 p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
            >
              ❌ Cancelar
            </button>
          </div>
        </>
      ) : (
        <div>
          <div className="p-3 bg-white rounded-lg border border-gray-200 mb-3 min-h-[2.5rem] flex items-center">
            <p className="text-sm text-gray-700">
              {currentTitle || "Sin título"}
            </p>
          </div>
          <button
            onClick={onStartEdit}
            className="w-full p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors"
          >
            ✏ Editar Título
          </button>
        </div>
      )}
    </div>
  );
};
import React from 'react';

interface TextEditorProps {
  isEditing: boolean;
  currentText: string;
  editingText: string;
  pageNumber: number;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTextChange: (value: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  isEditing,
  currentText,
  editingText,
  pageNumber,
  onStartEdit,
  onSave,
  onCancel,
  onTextChange
}) => {
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <label className="block text-sm font-bold text-gray-700 mb-3">
        ✏ Texto de página {pageNumber}:
      </label>

      {isEditing ? (
        <>
          <textarea
            value={editingText}
            onChange={(e) => onTextChange(e.target.value)}
            className="w-full p-3 border-2 border-blue-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 text-gray-900"
            rows={6}
            placeholder="Escribe tu texto aquí..."
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
          <div className="p-3 bg-white rounded-lg border border-gray-200 mb-3 max-h-24 overflow-auto min-h-[4rem]">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {currentText || "Sin texto"}
            </p>
          </div>
          <button
            onClick={onStartEdit}
            className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            📝 Editar Texto
          </button>
        </div>
      )}
    </div>
  );
};
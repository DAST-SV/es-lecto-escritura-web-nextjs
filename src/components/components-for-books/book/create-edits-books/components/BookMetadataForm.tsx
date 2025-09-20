import React from 'react';
import SelectFromTableAsync from '@/src/utils/components/SelectFromTableAsync';

interface BookMetadataFormProps {
  selectedCategoria: number | null;
  selectedGenero: number | null;
  descripcion: string;
  onCategoriaChange: (value: number | null) => void;
  onGeneroChange: (value: number | null) => void;
  onDescripcionChange: (value: string) => void;
  onSave: () => void;
}

export const BookMetadataForm: React.FC<BookMetadataFormProps> = ({
  selectedCategoria,
  selectedGenero,
  descripcion,
  onCategoriaChange,
  onGeneroChange,
  onDescripcionChange,
  onSave
}) => {
  return (
    <>
      {/* Campo de descripción */}
      <div className="mb-6 p-4 bg-pink-50 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          📝 Descripción del libro:
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => onDescripcionChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 resize-none text-gray-900"
          rows={4}
          placeholder="Describe brevemente de qué trata tu libro..."
        />
      </div>

      {/* Selector de categoría */}
      <div className="mb-6 p-4 bg-teal-50 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          📚 Categoría:
        </label>
        <SelectFromTableAsync<{ id_categoria: number; nombre: string }>
          table="categorias"
          valueField="id_categoria"
          labelField="nombre"
          filterField="nombre"
          value={selectedCategoria}
          placeholder="Selecciona una Categoría"
          onChange={(value) => onCategoriaChange(value as number)}
        />
      </div>

      {/* Selector de género */}
      <div className="mb-6 p-4 bg-cyan-50 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          🎭 Género:
        </label>
        <SelectFromTableAsync<{ id_genero: number; nombre: string }>
          table="generos"
          valueField="id_genero"
          labelField="nombre"
          filterField="nombre"
          value={selectedGenero}
          placeholder="Selecciona un Género"
          onChange={(value) => onGeneroChange(value as number)}
        />
      </div>

      {/* Botón de guardar */}
      <button
        onClick={onSave}
        className="w-full p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-medium transition-all mt-2"
      >
        📖 Guardar Libro
      </button>
    </>
  );
};
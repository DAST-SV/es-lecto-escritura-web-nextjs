import React from 'react';
import MultiSelectFromTable from '@/src/utils/components/MultiSelectFromTable';
import SelectFromTableAsync from '@/src/utils/components/SelectFromTableAsync';

interface BookMetadataFormProps {
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedNivel: number | null;
  autor: string;
  descripcion: string;
  titulo: string;
  onCategoriasChange: (values: (number | string)[]) => void;
  onGenerosChange: (values: (number | string)[]) => void;
  onEtiquetasChange: (values: (number | string)[]) => void;
  onNivelChange: (value: number | null) => void;
  onAutorChange: (value: string) => void;
  onDescripcionChange: (value: string) => void;
  onTituloChange: (value: string) => void;
  onSave: () => void;
}

export const BookMetadataForm: React.FC<BookMetadataFormProps> = ({
  selectedCategorias,
  selectedGeneros,
  selectedEtiquetas,
  selectedNivel,
  autor,
  descripcion,
  titulo,
  onCategoriasChange,
  onGenerosChange,
  onEtiquetasChange,
  onNivelChange,
  onAutorChange,
  onDescripcionChange,
  onTituloChange,
  onSave
}) => {
  return (
    <>
      {/* Campo de título */}
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          📖 Título del libro:
        </label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => onTituloChange(e.target.value)}
          placeholder="Título del libro..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          style={{
            backgroundColor: "#fff3cd",
            borderColor: "#ffcc80",
            borderRadius: "12px",
            fontSize: "16px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}
        />
      </div>

      

      {/* Campo de autor */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          👤 Autor del libro:
        </label>
        <input
          type="text"
          value={autor}
          onChange={(e) => onAutorChange(e.target.value)}
          placeholder="Nombre del autor..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
          style={{
            backgroundColor: "#fff3cd",
            borderColor: "#ffcc80",
            borderRadius: "12px",
            fontSize: "16px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}
        />
      </div>

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

      {/* Selector múltiple de categorías */}
      <div className="mb-6 p-4 bg-teal-50 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          📚 Tipo de Lectura (máximo 3):
        </label>
        <MultiSelectFromTable<{ id_categoria: number; nombre: string }>
          table="categorias"
          valueField="id_categoria"
          labelField="nombre"
          filterField="nombre"
          values={selectedCategorias}
          placeholder="Selecciona categorías..."
          onChange={onCategoriasChange}
          maxItems={1}
        />
      </div>

      {/* Selector múltiple de géneros */}
      <div className="mb-6 p-4 bg-cyan-50 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          🎭 Géneros (máximo 2):
        </label>
        <MultiSelectFromTable<{ id_genero: number; nombre: string }>
          table="generos"
          valueField="id_genero"
          labelField="nombre"
          filterField="nombre"
          values={selectedGeneros}
          placeholder="Selecciona géneros..."
          onChange={onGenerosChange}
          maxItems={2}
        />
      </div>

      {/* Selector múltiple de etiquetas */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          🏷 Etiquetas (máximo 5):
        </label>
        <MultiSelectFromTable<{ id_etiqueta: number; nombre: string }>
          table="etiquetas"
          valueField="id_etiqueta"
          labelField="nombre"
          filterField="nombre"
          values={selectedEtiquetas}
          placeholder="Selecciona etiquetas..."
          onChange={onEtiquetasChange}
          maxItems={5}
        />
      </div>

      {/* Selector único de nivel */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          📊 Nivel del libro:
        </label>
        <SelectFromTableAsync<{ id_nivel: number; nombre: string }>
          table="niveles"
          valueField="id_nivel"
          labelField="nombre"
          filterField="nombre"
          value={selectedNivel}
          placeholder="Selecciona un nivel..."
          onChange={(value) => onNivelChange(value as number)}
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
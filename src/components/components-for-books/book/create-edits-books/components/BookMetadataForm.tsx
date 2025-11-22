import React from 'react';
import MultiSelectFromTable from '@/src/utils/components/MultiSelectFromTable';
import SelectFromTableAsync from '@/src/utils/components/SelectFromTableAsync';
import MultiAuthorInput from '@/src/components/components-for-books/book/create-edits-books/components/MultiAuthorInput'
import MultiPersonajeInput from '@/src/components/components-for-books/book/create-edits-books/components/MultiPersonajeInput'

interface BookMetadataFormProps {
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedValores: (number | string)[];
  selectedNivel: number | null;
  autores: string[];
  personajes: string[];
  descripcion: string;
  titulo: string;
  onCategoriasChange: (values: (number | string)[]) => void;
  onGenerosChange: (values: (number | string)[]) => void;
  onEtiquetasChange: (values: (number | string)[]) => void;
  onValoresChange: (values: (number | string)[]) => void;
  onNivelChange: (value: number | null) => void;
  onAutoresChange: (value: string[]) => void;
  onPersonajesChange: (value: string[]) => void;
  onDescripcionChange: (value: string) => void;
  onTituloChange: (value: string) => void;
  onSave: () => void;

  // ⭐ NUEVO: Callbacks para obtener los nombres/labels
  onCategoriasLabelsChange?: (labels: string[]) => void;
  onGenerosLabelsChange?: (labels: string[]) => void;
  onEtiquetasLabelsChange?: (labels: string[]) => void;
  onValoresLabelsChange?: (labels: string[]) => void;
  onNivelLabelChange?: (label: string | null) => void;
}

export const BookMetadataForm: React.FC<BookMetadataFormProps> = ({
  selectedCategorias,
  selectedGeneros,
  selectedEtiquetas,
  selectedValores,
  selectedNivel,
  autores,
  personajes,
  descripcion,
  titulo,
  onCategoriasChange,
  onGenerosChange,
  onEtiquetasChange,
  onValoresChange,
  onNivelChange,
  onAutoresChange,
  onPersonajesChange,
  onDescripcionChange,
  onTituloChange,
  onSave,
  onCategoriasLabelsChange,
  onGenerosLabelsChange,
  onEtiquetasLabelsChange,
  onValoresLabelsChange,
  onNivelLabelChange
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
          👤 Autores del libro:
        </label>
        <MultiAuthorInput
          authors={autores}
          onChange={onAutoresChange}
          maxAuthors={5}
          placeholder="Escribe el nombre del autor y presiona Enter..."
        />
      </div>
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          🎭 Personajes del libro:
        </label>
        <MultiPersonajeInput
          personajes={personajes}
          onChange={onPersonajesChange}
          maxPersonajes={10}
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
          📚 Tipo de Lectura (máximo 1):
        </label>
        <MultiSelectFromTable<{ id_categoria: number; nombre: string }>
          table="categorias"
          valueField="id_categoria"
          labelField="nombre"
          filterField="nombre"
          values={selectedCategorias}
          placeholder="Selecciona categorías..."
          onChange={onCategoriasChange}
          onLabelsChange={onCategoriasLabelsChange}
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
          onLabelsChange={onGenerosLabelsChange}
          maxItems={2}
        />
      </div>

      {/* Selector múltiple de valores */}
      <div className="mb-6 p-4 bg-cyan-50 rounded-lg">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          🎭 Valores (máximo 5):
        </label>
        <MultiSelectFromTable<{ id_valor: number; nombre: string }>
          table="valores"
          valueField="id_valor"
          labelField="nombre"
          filterField="nombre"
          values={selectedValores}
          placeholder="Selecciona valores..."
          onChange={onValoresChange}
          onLabelsChange={onValoresLabelsChange}
          maxItems={5}
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
          onLabelsChange={onEtiquetasLabelsChange}
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
          onLabelChange={onNivelLabelChange}
        />
      </div>
    </>
  );
};
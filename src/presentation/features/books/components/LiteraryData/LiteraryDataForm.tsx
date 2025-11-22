/**
 * UBICACIÓN: src/presentation/features/books/components/LiteraryData/LiteraryDataForm.tsx
 * 
 * Formulario de Ficha Literaria del Libro
 * Contiene TODA la información descriptiva y de catalogación del libro
 */

import React from 'react';
import MultiSelectFromTable from '@/src/utils/components/MultiSelectFromTable';
import SelectFromTableAsync from '@/src/utils/components/SelectFromTableAsync';
import { MultiAuthorInput } from '../BookMetadata/MultiAuthorInput';
import { MultiPersonajeInput } from '../BookMetadata/MultiPersonajeInput';
import { PortadaControls } from '../BookMetadata/PortadaControls';
import { BookOpen, Users, User, FileText, Tag, Award, Star, Sparkles, Image as ImageIcon } from 'lucide-react';

interface LiteraryDataFormProps {
  // Datos básicos
  titulo: string;
  descripcion: string;
  portada: File | null;
  portadaUrl?: string | null;
  
  // Personas
  autores: string[];
  personajes: string[];
  
  // Clasificación
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedValores: (number | string)[];
  selectedNivel: number | null;

  // Handlers
  onTituloChange: (value: string) => void;
  onDescripcionChange: (value: string) => void;
  onPortadaChange: (value: File | null) => void;
  onAutoresChange: (values: string[]) => void;
  onPersonajesChange: (values: string[]) => void;
  onCategoriasChange: (values: (number | string)[]) => void;
  onGenerosChange: (values: (number | string)[]) => void;
  onEtiquetasChange: (values: (number | string)[]) => void;
  onValoresChange: (values: (number | string)[]) => void;
  onNivelChange: (value: number | null) => void;
}

export function LiteraryDataForm({
  titulo,
  descripcion,
  portada,
  portadaUrl,
  autores,
  personajes,
  selectedCategorias,
  selectedGeneros,
  selectedEtiquetas,
  selectedValores,
  selectedNivel,
  onTituloChange,
  onDescripcionChange,
  onPortadaChange,
  onAutoresChange,
  onPersonajesChange,
  onCategoriasChange,
  onGenerosChange,
  onEtiquetasChange,
  onValoresChange,
  onNivelChange,
}: LiteraryDataFormProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="text-indigo-600" size={20} />
          <h3 className="font-bold text-gray-900">Ficha Literaria</h3>
        </div>
        <p className="text-xs text-gray-600">
          Completa toda la información del libro para una mejor catalogación
        </p>
      </div>

      {/* SECCIÓN 1: Información Básica */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
          <FileText size={16} className="text-indigo-600" />
          <h4 className="text-sm font-semibold text-gray-700">Información Básica</h4>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            📖 Título del libro <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => onTituloChange(e.target.value)}
            placeholder="Escribe el título de tu libro..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
          />
          <p className="text-xs text-gray-500">
            Un título atractivo captura la atención de los lectores
          </p>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            📝 Descripción del libro <span className="text-red-500">*</span>
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => onDescripcionChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none text-gray-900"
            rows={4}
            placeholder="Describe brevemente de qué trata tu libro..."
          />
          <p className="text-xs text-gray-500">
            Explica la historia o temática principal (máx. 200 palabras)
          </p>
        </div>

        {/* Portada */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <ImageIcon size={16} />
            Portada del libro <span className="text-red-500">*</span>
          </label>
          <PortadaControls
            onImageChange={onPortadaChange}
            portada={portada}
            portadaUrl={portadaUrl}
          />
        </div>
      </div>

      {/* SECCIÓN 2: Autoría y Personajes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
          <Users size={16} className="text-green-600" />
          <h4 className="text-sm font-semibold text-gray-700">Autoría y Personajes</h4>
        </div>

        {/* Autores */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <User size={16} />
            Autores del libro <span className="text-red-500">*</span>
          </label>
          <MultiAuthorInput
            authors={autores}
            onChange={onAutoresChange}
            maxAuthors={5}
            placeholder="Escribe el nombre del autor y presiona Enter..."
          />
          <p className="text-xs text-gray-500">
            Agrega hasta 5 autores que participaron en la creación del libro
          </p>
        </div>

        {/* Personajes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Sparkles size={16} />
            Personajes principales
          </label>
          <MultiPersonajeInput
            personajes={personajes}
            onChange={onPersonajesChange}
            maxPersonajes={10}
          />
          <p className="text-xs text-gray-500">
            Lista los personajes más importantes de la historia (opcional)
          </p>
        </div>
      </div>

      {/* SECCIÓN 3: Clasificación */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
          <Tag size={16} className="text-purple-600" />
          <h4 className="text-sm font-semibold text-gray-700">Clasificación</h4>
        </div>

        {/* Categorías */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Tag size={16} />
            Tipo de Lectura <span className="text-red-500">*</span>
          </label>
          <MultiSelectFromTable<{ id_categoria: number; nombre: string }>
            table="categorias"
            valueField="id_categoria"
            labelField="nombre"
            filterField="nombre"
            values={selectedCategorias}
            placeholder="Selecciona una categoría..."
            onChange={onCategoriasChange}
            maxItems={1}
          />
          <p className="text-xs text-gray-500">
            Define el tipo principal de lectura (ficción, no ficción, educativo, etc.)
          </p>
        </div>

        {/* Géneros */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Star size={16} />
            Géneros Literarios <span className="text-red-500">*</span>
          </label>
          <MultiSelectFromTable<{ id_genero: number; nombre: string }>
            table="generos"
            valueField="id_genero"
            labelField="nombre"
            filterField="nombre"
            values={selectedGeneros}
            placeholder="Selecciona hasta 2 géneros..."
            onChange={onGenerosChange}
            maxItems={2}
          />
          <p className="text-xs text-gray-500">
            Elige los géneros que mejor describen tu libro (máx. 2)
          </p>
        </div>

        {/* Nivel */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Award size={16} />
            Nivel de Lectura
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
          <p className="text-xs text-gray-500">
            Indica el nivel de dificultad o edad recomendada para los lectores
          </p>
        </div>
      </div>

      {/* SECCIÓN 4: Etiquetas y Valores */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
          <Sparkles size={16} className="text-pink-600" />
          <h4 className="text-sm font-semibold text-gray-700">Etiquetas y Valores</h4>
        </div>

        {/* Valores */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Award size={16} />
            Valores que transmite
          </label>
          <MultiSelectFromTable<{ id_valor: number; nombre: string }>
            table="valores"
            valueField="id_valor"
            labelField="nombre"
            filterField="nombre"
            values={selectedValores}
            placeholder="Selecciona hasta 5 valores..."
            onChange={onValoresChange}
            maxItems={5}
          />
          <p className="text-xs text-gray-500">
            ¿Qué valores o enseñanzas transmite tu libro? (amistad, respeto, etc.)
          </p>
        </div>

        {/* Etiquetas */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Tag size={16} />
            Etiquetas adicionales
          </label>
          <MultiSelectFromTable<{ id_etiqueta: number; nombre: string }>
            table="etiquetas"
            valueField="id_etiqueta"
            labelField="nombre"
            filterField="nombre"
            values={selectedEtiquetas}
            placeholder="Selecciona hasta 5 etiquetas..."
            onChange={onEtiquetasChange}
            maxItems={5}
          />
          <p className="text-xs text-gray-500">
            Agrega palabras clave para facilitar la búsqueda de tu libro
          </p>
        </div>
      </div>

      {/* Footer - Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-6">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Una ficha literaria completa ayuda a los lectores a descubrir 
          tu libro más fácilmente. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
        </p>
      </div>
    </div>
  );
}
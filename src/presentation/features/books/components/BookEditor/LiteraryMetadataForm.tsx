/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/LiteraryMetadataForm.tsx
 * ✅ ACTUALIZADO: Usa los nombres de tabla del nuevo schema books.*
 * 
 * Mapeo de tablas viejas -> nuevas:
 * - categorias -> book_categories
 * - generos -> book_genres
 * - niveles -> book_levels
 * - valores -> book_values
 * - etiquetas -> book_tags
 */

'use client';

import React, { useState } from 'react';
import { BookOpen, Tag } from 'lucide-react';
import { MultiAuthorInput } from '../BookMetadata/MultiAuthorInput';
import { MultiPersonajeInput } from '../BookMetadata/MultiPersonajeInput';
import { MultiSelectFromTable } from '../BookMetadata/MultiSelectFromTable';
import { SelectFromTableAsync } from '../BookMetadata/SelectFromTableAsync';

interface LiteraryMetadataFormProps {
  titulo: string;
  descripcion: string;
  autores: string[];
  personajes: string[];
  portada: File | null;
  portadaUrl?: string | null;
  cardBackgroundImage: File | null;
  cardBackgroundUrl: string | null;
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedValores: (number | string)[];
  selectedNivel: number | null;
  
  onTituloChange: (value: string) => void;
  onDescripcionChange: (value: string) => void;
  onAutoresChange: (values: string[]) => void;
  onPersonajesChange: (values: string[]) => void;
  onPortadaChange: (value: File | null) => void;
  onCardBackgroundChange: (file: File | null) => void;
  
  onCategoriasChange: (values: (number | string)[]) => void;
  onGenerosChange: (values: (number | string)[]) => void;
  onEtiquetasChange: (values: (number | string)[]) => void;
  onValoresChange: (values: (number | string)[]) => void;
  onNivelChange: (value: number | null) => void;
  
  onCategoriasLabelsChange: (labels: string[]) => void;
  onGenerosLabelsChange: (labels: string[]) => void;
  onEtiquetasLabelsChange: (labels: string[]) => void;
  onValoresLabelsChange: (labels: string[]) => void;
  onNivelLabelChange: (label: string | null) => void;
}

export function LiteraryMetadataForm({
  titulo,
  descripcion,
  autores,
  personajes,
  cardBackgroundImage,
  cardBackgroundUrl,
  selectedCategorias,
  selectedGeneros,
  selectedEtiquetas,
  selectedValores,
  selectedNivel,
  onTituloChange,
  onDescripcionChange,
  onAutoresChange,
  onPersonajesChange,
  onCardBackgroundChange,
  onCategoriasChange,
  onCategoriasLabelsChange,
  onGenerosChange,
  onGenerosLabelsChange,
  onEtiquetasChange,
  onEtiquetasLabelsChange,
  onValoresChange,
  onValoresLabelsChange,
  onNivelChange,
  onNivelLabelChange,
}: LiteraryMetadataFormProps) {

  const [activeTab, setActiveTab] = useState<'basic' | 'classification'>('basic');

  const descripcionLength = descripcion.length;
  const descripcionLimit = 800;
  const descripcionNearLimit = descripcionLength > descripcionLimit * 0.8;
  const descripcionOverLimit = descripcionLength > descripcionLimit;

  const tabs = [
    { id: 'basic', icon: BookOpen, label: 'Básico', color: 'indigo' },
    { id: 'classification', icon: Tag, label: 'Clasificación', color: 'purple' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50">
        <div className="flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-all
                  ${isActive 
                    ? 'text-white border-b-2' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
                style={isActive ? {
                  backgroundColor: tab.color === 'indigo' ? '#4f46e5' : tab.color === 'purple' ? '#9333ea' : '#16a34a',
                  borderBottomColor: tab.color === 'indigo' ? '#3730a3' : tab.color === 'purple' ? '#7e22ce' : '#15803d'
                } : {}}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content con scroll independiente */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        
        {/* TAB: Básico */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Título del Libro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => onTituloChange(e.target.value)}
                placeholder="Ej: El Principito"
                className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-all"
              />
            </div>

            {/* Descripción */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs font-medium ${
                  descripcionOverLimit 
                    ? 'text-red-600' 
                    : descripcionNearLimit 
                      ? 'text-orange-600' 
                      : 'text-gray-500'
                }`}>
                  {descripcionLength}/{descripcionLimit} caracteres
                </span>
              </div>
              
              <textarea
                value={descripcion}
                maxLength={descripcionLimit}
                onChange={(e) => onDescripcionChange(e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:ring-2 resize-none text-gray-900 transition-all ${
                  descripcionOverLimit
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : descripcionNearLimit
                      ? 'border-orange-300 focus:ring-orange-500 focus:border-orange-500'
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                rows={6}
                placeholder="Describe de qué trata el libro... (máximo 800 caracteres)"
              />
            </div>

            {/* Autores */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Autores <span className="text-red-500">*</span>
              </label>
              <MultiAuthorInput
                authors={autores}
                onChange={onAutoresChange}
                maxAuthors={5}
                placeholder="Nombre del autor..."
              />
            </div>

            {/* Personajes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Personajes Principales
              </label>
              <MultiPersonajeInput
                personajes={personajes}
                onChange={onPersonajesChange}
                maxPersonajes={10}
              />
            </div>
          </div>
        )}

        {/* TAB: Clasificación */}
        {activeTab === 'classification' && (
          <div className="space-y-4">
            {/* Categorías - TABLA: book_categories */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tipo de Lectura <span className="text-red-500">*</span>
              </label>
              <MultiSelectFromTable<{ id: number; name: string }>
                table="book_categories"
                valueField="id"
                labelField="name"
                filterField="name"
                values={selectedCategorias}
                placeholder="Selecciona una categoría..."
                onChange={onCategoriasChange}
                onLabelsChange={onCategoriasLabelsChange}
                maxItems={1}
                color="blue"
              />
            </div>

            {/* Géneros - TABLA: book_genres */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Géneros Literarios <span className="text-red-500">*</span>
              </label>
              <MultiSelectFromTable<{ id: number; name: string }>
                table="book_genres"
                valueField="id"
                labelField="name"
                filterField="name"
                values={selectedGeneros}
                placeholder="Hasta 2 géneros..."
                onChange={onGenerosChange}
                onLabelsChange={onGenerosLabelsChange}
                maxItems={2}
                color="purple"
              />
            </div>

            {/* Nivel - TABLA: book_levels */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nivel de Lectura
              </label>
              <SelectFromTableAsync<{ id: number; name: string }>
                table="book_levels"
                valueField="id"
                labelField="name"
                filterField="name"
                value={selectedNivel}
                placeholder="Selecciona un nivel..."
                onChange={(value) => onNivelChange(value as number)}
                onLabelChange={onNivelLabelChange}
                color="green"
              />
            </div>

            {/* Valores - TABLA: book_values */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Valores que Transmite
              </label>
              <MultiSelectFromTable<{ id: number; name: string }>
                table="book_values"
                valueField="id"
                labelField="name"
                filterField="name"
                values={selectedValores}
                placeholder="Hasta 5 valores..."
                onChange={onValoresChange}
                onLabelsChange={onValoresLabelsChange}
                maxItems={5}
                color="green"
              />
            </div>

            {/* Etiquetas - TABLA: book_tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Etiquetas Adicionales
              </label>
              <MultiSelectFromTable<{ id: number; name: string }>
                table="book_tags"
                valueField="id"
                labelField="name"
                filterField="name"
                values={selectedEtiquetas}
                placeholder="Hasta 5 etiquetas..."
                onChange={onEtiquetasChange}
                onLabelsChange={onEtiquetasLabelsChange}
                maxItems={5}
                color="pink"
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 Las etiquetas ayudan a categorizar y buscar tu libro
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
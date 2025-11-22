/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/LiteraryMetadataForm.tsx
 * 
 * Formulario profesional para editar metadatos del libro
 * CORREGIDO: Sin portada en imágenes, solo fondo de ficha
 */

'use client';

import React, { useState } from 'react';
import { BookOpen, Tag, Image as ImageIcon } from 'lucide-react';
import MultiSelectFromTable from '@/src/utils/components/MultiSelectFromTable';
import SelectFromTableAsync from '@/src/utils/components/SelectFromTableAsync';
import { MultiAuthorInput } from '../BookMetadata/MultiAuthorInput';
import { MultiPersonajeInput } from '../BookMetadata/MultiPersonajeInput';

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
  onGenerosChange,
  onEtiquetasChange,
  onValoresChange,
  onNivelChange,
}: LiteraryMetadataFormProps) {

  const [activeTab, setActiveTab] = useState<'basic' | 'classification' | 'image'>('basic');

  const tabs = [
    { id: 'basic', icon: BookOpen, label: 'Básico', color: 'indigo' },
    { id: 'classification', icon: Tag, label: 'Clasificación', color: 'purple' },
    { id: 'image', icon: ImageIcon, label: 'Imagen', color: 'green' },
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => onDescripcionChange(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-gray-900 transition-all"
                rows={4}
                placeholder="Describe de qué trata el libro..."
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
            {/* Categorías */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
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
            </div>

            {/* Géneros */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Géneros Literarios <span className="text-red-500">*</span>
              </label>
              <MultiSelectFromTable<{ id_genero: number; nombre: string }>
                table="generos"
                valueField="id_genero"
                labelField="nombre"
                filterField="nombre"
                values={selectedGeneros}
                placeholder="Hasta 2 géneros..."
                onChange={onGenerosChange}
                maxItems={2}
              />
            </div>

            {/* Nivel */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
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
            </div>

            {/* Valores */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Valores que Transmite
              </label>
              <MultiSelectFromTable<{ id_valor: number; nombre: string }>
                table="valores"
                valueField="id_valor"
                labelField="nombre"
                filterField="nombre"
                values={selectedValores}
                placeholder="Hasta 5 valores..."
                onChange={onValoresChange}
                maxItems={5}
              />
            </div>

            {/* Etiquetas */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Etiquetas Adicionales
              </label>
              <MultiSelectFromTable<{ id_etiqueta: number; nombre: string }>
                table="etiquetas"
                valueField="id_etiqueta"
                labelField="nombre"
                filterField="nombre"
                values={selectedEtiquetas}
                placeholder="Hasta 5 etiquetas..."
                onChange={onEtiquetasChange}
                maxItems={5}
              />
            </div>
          </div>
        )}

        {/* TAB: Imagen (solo fondo de ficha) */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            {/* Imagen de fondo de ficha */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Imagen de Fondo de la Ficha
              </label>
              <div className="space-y-3">
                <label className="block cursor-pointer">
                  <div className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                    📤 {cardBackgroundImage || cardBackgroundUrl ? 'Cambiar Imagen' : 'Subir Imagen'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onCardBackgroundChange(file || null);
                    }}
                    className="hidden"
                  />
                </label>

                {(cardBackgroundImage || cardBackgroundUrl) && (
                  <button
                    onClick={() => onCardBackgroundChange(null)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    🗑️ Quitar Imagen
                  </button>
                )}
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 Esta imagen será el fondo de la tarjeta pública del libro
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
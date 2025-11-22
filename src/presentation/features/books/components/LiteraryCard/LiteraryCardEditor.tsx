/**
 * UBICACIÓN: src/presentation/features/books/components/LiteraryCard/LiteraryCardEditor.tsx
 * 
 * Editor de Ficha Literaria - Tarjeta de presentación pública del libro
 * Esta es la imagen/tarjeta que se mostrará en carousels, catálogos, búsquedas, etc.
 * TOTALMENTE SEPARADO del contenido de las páginas del libro
 */

'use client';

import React, { useState, useRef } from 'react';
import {
  BookOpen, Upload, Image as ImageIcon, Sparkles, Eye,
  CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import { LiteraryCardPreview } from './LiteraryCardPreview';

interface LiteraryCardEditorProps {
  // Datos del libro
  titulo: string;
  autores: string[];
  descripcion: string;
  
  // Clasificación
  categorias: string[];
  generos: string[];
  valores: string[];
  nivel: string | null;
  
  // Imagen de fondo de la ficha
  cardBackgroundImage: File | null;
  cardBackgroundUrl: string | null;
  
  // Handlers
  onCardBackgroundChange: (file: File | null) => void;
}

export function LiteraryCardEditor({
  titulo,
  autores,
  descripcion,
  categorias,
  generos,
  valores,
  nivel,
  cardBackgroundImage,
  cardBackgroundUrl,
  onCardBackgroundChange,
}: LiteraryCardEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // URL temporal para preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(cardBackgroundUrl);

  // Handler para cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('⚠️ Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máx 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('⚠️ La imagen es muy grande. Máximo 5MB');
      return;
    }

    // Crear URL de preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Notificar al padre
    onCardBackgroundChange(file);
  };

  // Quitar imagen
  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onCardBackgroundChange(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validaciones
  const hasImage = !!previewUrl;
  const hasTitle = titulo.trim().length > 0;
  const hasAuthors = autores.length > 0;
  const hasDescription = descripcion.trim().length > 0;
  const hasCategories = categorias.length > 0;
  const hasGenres = generos.length > 0;
  
  const isComplete = hasImage && hasTitle && hasAuthors && hasDescription && hasCategories && hasGenres;

  return (
    <div className="space-y-6">
      {/* Header explicativo */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Sparkles className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              🎨 Ficha Literaria Pública
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Esta es la <strong>tarjeta de presentación</strong> de tu libro que se mostrará 
              en carousels, catálogos y búsquedas. Es independiente del contenido de las páginas.
            </p>
          </div>
        </div>
      </div>

      {/* Estado de completitud */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600" />
            Estado de la Ficha
          </h4>
          {isComplete ? (
            <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
              ✓ Completa
            </span>
          ) : (
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              ⚠ Incompleta
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`flex items-center gap-2 ${hasImage ? 'text-green-600' : 'text-gray-400'}`}>
            {hasImage ? '✓' : '○'} Imagen de fondo
          </div>
          <div className={`flex items-center gap-2 ${hasTitle ? 'text-green-600' : 'text-gray-400'}`}>
            {hasTitle ? '✓' : '○'} Título
          </div>
          <div className={`flex items-center gap-2 ${hasAuthors ? 'text-green-600' : 'text-gray-400'}`}>
            {hasAuthors ? '✓' : '○'} Autores
          </div>
          <div className={`flex items-center gap-2 ${hasDescription ? 'text-green-600' : 'text-gray-400'}`}>
            {hasDescription ? '✓' : '○'} Descripción
          </div>
          <div className={`flex items-center gap-2 ${hasCategories ? 'text-green-600' : 'text-gray-400'}`}>
            {hasCategories ? '✓' : '○'} Categorías
          </div>
          <div className={`flex items-center gap-2 ${hasGenres ? 'text-green-600' : 'text-gray-400'}`}>
            {hasGenres ? '✓' : '○'} Géneros
          </div>
        </div>
      </div>

      {/* Editor de imagen de fondo */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
            <ImageIcon size={18} className="text-indigo-600" />
            Imagen de Fondo de la Ficha
          </h4>
          <p className="text-xs text-gray-600">
            Esta imagen será el fondo de tu ficha literaria. Usa una imagen atractiva 
            que represente tu libro (puede ser diferente a la portada).
          </p>
        </div>

        {/* Zona de carga */}
        {!hasImage ? (
          <label className="block cursor-pointer">
            <div className="border-3 border-dashed border-indigo-300 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-indigo-200 rounded-full flex items-center justify-center mb-4">
                  <Upload size={32} className="text-indigo-600" />
                </div>
                
                <h5 className="font-semibold text-gray-900 mb-2">
                  Sube la imagen de fondo
                </h5>
                
                <p className="text-sm text-gray-600 mb-4">
                  Haz clic o arrastra una imagen aquí
                </p>
                
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  <ImageIcon size={18} />
                  Seleccionar imagen
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  JPG, PNG o WebP • Máximo 5MB • Recomendado: 1200x800px
                </p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        ) : (
          // Preview de la imagen cargada
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
              <img
                src={previewUrl}
                alt="Fondo de ficha literaria"
                className="w-full h-64 object-cover"
              />
              
              {/* Overlay con info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div className="text-white">
                  <p className="text-xs font-medium">✓ Imagen cargada</p>
                  <p className="text-xs opacity-80">Esta será el fondo de tu ficha</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
                  <Upload size={16} />
                  Cambiar imagen
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleRemoveImage}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                🗑 Quitar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview de la ficha */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Eye size={18} className="text-purple-600" />
            Vista Previa de la Ficha
          </h4>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            {showPreview ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {showPreview && (
          <div className="mt-4">
            <LiteraryCardPreview
              backgroundUrl={previewUrl}
              titulo={titulo}
              autores={autores}
              descripcion={descripcion}
              categorias={categorias}
              generos={generos}
              valores={valores}
              nivel={nivel}
            />
          </div>
        )}

        {!showPreview && (
          <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
            Haz clic en "Mostrar" para ver cómo se verá tu ficha literaria
          </div>
        )}
      </div>

      {/* Ayuda contextual */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">💡 Consejos para una buena ficha:</p>
            <ul className="space-y-1 text-xs">
              <li>• Usa una imagen de alta calidad y atractiva</li>
              <li>• La imagen debe representar el tema o ambiente del libro</li>
              <li>• Puede ser diferente a tu portada (página 1)</li>
              <li>• Esta ficha se usará en carousels y catálogos públicos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Alerta si está incompleta */}
      {!isComplete && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-semibold text-orange-900 mb-1">
                ⚠️ Ficha incompleta
              </p>
              <p className="text-xs text-orange-800">
                Completa todos los campos marcados arriba para que tu ficha sea visible 
                en búsquedas y catálogos. Especialmente la imagen de fondo es importante.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { BookOpen, User, FileText, Tag, Award, Star } from 'lucide-react';

interface CoverPreviewProps {
  portada: File | null;
  portadaUrl?: string | null;
  titulo: string;
  autor: string;
  descripcion: string;
  categorias?: string[];
  generos?: string[];
  nivel?: string | null;
}

export const CoverPreview: React.FC<CoverPreviewProps> = ({
  portada,
  portadaUrl,
  titulo,
  autor,
  descripcion,
  categorias = [],
  generos = [],
  nivel
}) => {
  // Obtener URL de la imagen
  const imageUrl = React.useMemo(() => {
    if (portada) {
      return URL.createObjectURL(portada);
    }
    return portadaUrl;
  }, [portada, portadaUrl]);

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Función para truncar lista
  const truncateList = (list: string[], maxItems: number) => {
    if (list.length <= maxItems) return list;
    return list.slice(0, maxItems);
  };

  // Limpiar URL al desmontar
  React.useEffect(() => {
    return () => {
      if (portada && imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [portada, imageUrl]);

  const hasMoreAutor = autor && autor.split(' ').length > 3;
  const hasMoreDescripcion = descripcion && descripcion.length > 200;
  const hasMoreCategorias = categorias.length > 3;
  const hasMoreGeneros = generos.length > 3;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <BookOpen size={20} />
          Vista Previa de Portada
        </h3>
        <p className="text-xs opacity-90 mt-1">Así se verá tu libro en catálogos</p>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Columna izquierda: Imagen */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[280px] aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md overflow-hidden border-2 border-gray-300">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="Portada del libro"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <BookOpen size={48} className="mb-2" />
                  <p className="text-sm font-medium">Sin portada</p>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Información */}
          <div className="space-y-4">
            {/* Título */}
            <div>
              <h4 className="text-2xl font-bold text-gray-900 leading-tight">
                {titulo || 'Sin título'}
              </h4>
            </div>

            {/* Autor */}
            {autor && (
              <div className="flex items-start gap-2">
                <User size={16} className="text-indigo-600 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">
                    {truncateText(autor, 50)}
                    {hasMoreAutor && (
                      <span className="text-indigo-600 ml-1" title={autor}>...</span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Nivel */}
            {nivel && (
              <div className="flex items-center gap-2">
                <Award size={16} className="text-yellow-600 flex-shrink-0" />
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                  {nivel}
                </span>
              </div>
            )}

            {/* Descripción */}
            {descripcion && (
              <div className="flex items-start gap-2">
                <FileText size={16} className="text-gray-500 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {truncateText(descripcion, 200)}
                    {hasMoreDescripcion && (
                      <span className="text-indigo-600 font-medium cursor-pointer ml-1" title={descripcion}>
                        ... leer más
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Categorías */}
            {categorias.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-blue-600" />
                  <span className="text-xs font-semibold text-gray-700">Categorías:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 ml-6">
                  {truncateList(categorias, 3).map((cat, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                  {hasMoreCategorias && (
                    <span className="text-xs text-blue-600 font-medium px-2 py-0.5">
                      +{categorias.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Géneros */}
            {generos.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-purple-600" />
                  <span className="text-xs font-semibold text-gray-700">Géneros:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 ml-6">
                  {truncateList(generos, 3).map((gen, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium"
                    >
                      {gen}
                    </span>
                  ))}
                  {hasMoreGeneros && (
                    <span className="text-xs text-purple-600 font-medium px-2 py-0.5">
                      +{generos.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con nota */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            ℹ️ Esta es una vista previa simplificada. Algunos datos pueden estar truncados.
          </p>
        </div>
      </div>
    </div>
  );
};
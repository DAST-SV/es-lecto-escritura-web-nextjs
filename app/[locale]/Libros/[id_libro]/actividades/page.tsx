'use client';

import { useActividadesLibro } from '@/src/components/components-for-books/book/books/hooks/useActividadesLibro';
import { BookOpen, Plus, FileQuestion, Trash2, Edit3, Eye, Clock, Target, Award, Star } from 'lucide-react';

export default function ActividadesLibroPage() {
  const {
    id_libro,
    router,
    libro,
    actividades,
    loading,
    error,
    fetchData,
    handleDeleteActividad,
    handleToggleOficial,
  } = useActividadesLibro();

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-bold text-indigo-700">Cargando actividades...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md border-2 border-red-200">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-red-600 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 🎯 Header */}
      <div className="bg-white shadow-lg border-b-4 border-indigo-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => router.push('/Libros')}
            className="text-indigo-600 hover:text-indigo-800 mb-6 flex items-center gap-2 font-bold transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a mis libros
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">{libro?.titulo}</h1>
                {libro?.descripcion && (
                  <p className="text-gray-600 text-lg max-w-2xl">{libro.descripcion}</p>
                )}
                <div className="flex items-center gap-4 mt-3">
                  <div className="bg-indigo-100 px-4 py-2 rounded-xl">
                    <p className="text-sm font-bold text-indigo-700">
                      📚 {actividades.length} {actividades.length === 1 ? 'Actividad' : 'Actividades'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* 🎨 Crear nueva actividad */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="w-7 h-7 text-indigo-600" />
            <h2 className="text-3xl font-black text-gray-900">Crear Nueva Actividad</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quiz */}
            <button
              onClick={() => router.push(`/Libros/${id_libro}/actividades/quiz/crear`)}
              className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-indigo-400 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-300"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-md group-hover:scale-110 transition-transform">
                    <FileQuestion className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-green-100 px-3 py-1 rounded-full">
                    <span className="text-xs font-bold text-green-700">Disponible</span>
                  </div>
                </div>
                
                <h3 className="font-black text-gray-900 text-2xl mb-2 group-hover:text-indigo-600 transition-colors">
                  Quiz Interactivo
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Crea evaluaciones con preguntas de opción múltiple, verdadero/falso o respuestas abiertas.
                </p>
                
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <span>Crear ahora</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Flashcards - Próximamente */}
            <div className="relative bg-white p-8 rounded-3xl shadow-md border-2 border-gray-200 opacity-60">
              <div className="absolute top-4 right-4 bg-yellow-100 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-yellow-700">Próximamente</span>
              </div>
              
              <div className="p-4 bg-gray-100 rounded-2xl shadow-sm w-fit mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              
              <h3 className="font-black text-gray-900 text-2xl mb-2">Flashcards</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Tarjetas de estudio interactivas para memorización y práctica.
              </p>
            </div>

            {/* Completar - Próximamente */}
            <div className="relative bg-white p-8 rounded-3xl shadow-md border-2 border-gray-200 opacity-60">
              <div className="absolute top-4 right-4 bg-yellow-100 px-3 py-1 rounded-full">
                <span className="text-xs font-bold text-yellow-700">Próximamente</span>
              </div>
              
              <div className="p-4 bg-gray-100 rounded-2xl shadow-sm w-fit mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              
              <h3 className="font-black text-gray-900 text-2xl mb-2">Completar Texto</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Ejercicios de completar espacios en blanco para reforzar vocabulario.
              </p>
            </div>
          </div>
        </div>

        {/* 📚 Actividades creadas */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-7 h-7 text-indigo-600" />
            <h2 className="text-3xl font-black text-gray-900">Actividades Creadas</h2>
          </div>

          {actividades.length === 0 ? (
            <div className="bg-white rounded-3xl border-4 border-dashed border-indigo-200 p-16 text-center shadow-sm">
              <div className="max-w-md mx-auto">
                <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileQuestion className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-3">
                  ¡Aún no hay actividades!
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  Comienza creando tu primera actividad para este libro y dale vida a tu contenido educativo
                </p>
                <button
                  onClick={() => router.push(`/Libros/${id_libro}/actividades/quiz/crear`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Crear Primera Actividad
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {actividades.map((actividad, index) => (
                <div
                  key={actividad.id_actividad}
                  className="group bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition-all border-2 border-indigo-100 hover:border-indigo-300"
                >
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                        <FileQuestion className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {actividad.titulo}
                          </h3>
                        </div>
                        {actividad.descripcion && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {actividad.descripcion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                {/* 🎯 Toggle de actividad oficial */}
                <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className={`w-5 h-5 ${actividad.es_oficial ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          Actividad Oficial del Cuento
                        </p>
                        <p className="text-xs text-gray-600">
                          Se mostrará en el botón "Desafío"
                        </p>
                      </div>
                    </div>
                    
                    {/* 🔘 Toggle Switch */}
                    <button
                      onClick={() => handleToggleOficial(actividad.id_actividad, actividad.es_oficial)}
                      className={`
                        relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
                        ${actividad.es_oficial ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300
                          ${actividad.es_oficial ? 'translate-x-7' : 'translate-x-1'}
                        `}
                      >
                        {actividad.es_oficial && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500 m-1" />
                        )}
                      </span>
                    </button>
                  </div>
                </div>



                  {/* Estadísticas */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-indigo-50 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Target className="w-4 h-4 text-indigo-600" />
                      </div>
                      <p className="text-xs text-gray-600 mb-1">Puntos</p>
                      <p className="text-lg font-black text-indigo-600">
                        {actividad.puntos_maximos || 100}
                      </p>
                    </div>

                    {actividad.tiempo_limite && (
                      <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-xs text-gray-600 mb-1">Tiempo</p>
                        <p className="text-lg font-black text-blue-600">
                          {Math.floor(actividad.tiempo_limite / 60)}m
                        </p>
                      </div>
                    )}

                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Intentos</p>
                      <p className="text-lg font-black text-green-600">
                        {actividad.intentos_permitidos || '∞'}
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => router.push(`/libros/${id_libro}/quiz/${actividad.id_actividad}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/Libros/${id_libro}/actividades/quiz/editar/${actividad.id_actividad}`)
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteActividad(actividad.id_actividad)}
                      className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
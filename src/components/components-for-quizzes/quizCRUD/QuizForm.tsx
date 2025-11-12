'use client';

import React from 'react';
import { BookOpen, Plus, Trash2, Check, X, Sparkles, Star, HelpCircle, Loader2 } from 'lucide-react';
import { useQuizForm } from '@/src/components/components-for-quizzes/hooks/useQuizForm';

interface QuizFormProps {
  id_libro: string;
  id_actividad?: string; // Requerido en modo edit
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
}

export default function QuizForm({ id_libro, id_actividad, mode = 'create', onSuccess }: QuizFormProps) {
  // Validación: si es modo edit, id_actividad es obligatorio
  if (mode === 'edit' && !id_actividad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center border-2 border-red-300">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-red-600 mb-2">Error de Configuración</h2>
          <p className="text-gray-700 font-medium">
            Para editar un quiz es necesario proporcionar el <code className="bg-red-100 px-2 py-1 rounded">id_actividad</code>
          </p>
        </div>
      </div>
    );
  }

  const {
    formData,
    setFormData,
    loading,
    loadingData,
    handleSubmit,
    addPregunta,
    removePregunta,
    updatePregunta,
    addOpcion,
    removeOpcion,
    updateOpcion,
    totalPuntos,
  } = useQuizForm({
    id_libro,
    id_actividad,
    mode,
    onSuccess,
  });

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-bold text-indigo-700">Cargando tu quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 border-2 border-indigo-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-4 rounded-2xl shadow-md">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                {mode === 'edit' ? '✏️ Editar Quiz' : '🎨 Crear Quiz'}
              </h1>
              <p className="text-gray-600 font-medium flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Diseña preguntas para evaluar a tus estudiantes
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información básica del quiz */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-blue-200">
            <h2 className="text-2xl font-black text-blue-700 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              Información del Quiz
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📝 Título del Quiz *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-lg font-medium"
                  placeholder="Ej: Quiz de Matemáticas - Fracciones"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  💭 Descripción (opcional)
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                  rows={3}
                  placeholder="Describe de qué trata este quiz..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🎯 Puntos Máximos
                  </label>
                  <input
                    type="number"
                    value={formData.puntos_maximos}
                    onChange={(e) => setFormData({ ...formData, puntos_maximos: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all text-lg font-bold text-center"
                    min="1"
                  />
                </div>
                <div className="flex items-end">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-3 w-full text-center">
                    <p className="text-xs font-bold text-gray-600">Total de puntos:</p>
                    <p className="text-2xl font-black text-orange-600">{totalPuntos}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ⏱️ Tiempo Límite (segundos)
                  </label>
                  <input
                    type="number"
                    value={formData.tiempo_limite || ''}
                    onChange={(e) => setFormData({ ...formData, tiempo_limite: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                    placeholder="Sin límite"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🔄 Intentos Permitidos
                  </label>
                  <input
                    type="number"
                    value={formData.intentos_permitidos || ''}
                    onChange={(e) => setFormData({ ...formData, intentos_permitidos: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                    placeholder="Ilimitados"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preguntas */}
          <div className="space-y-4">
            {formData.preguntas.map((pregunta, pIndex) => (
              <div
                key={pIndex}
                className="bg-white rounded-3xl shadow-lg p-6 border-2 border-indigo-200 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-md">
                      {pIndex + 1}
                    </div>
                    <h3 className="text-xl font-black text-indigo-700">
                      Pregunta {pIndex + 1}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePregunta(pIndex)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-colors border border-red-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Escribe tu pregunta *
                    </label>
                    <textarea
                      value={pregunta.texto_pregunta}
                      onChange={(e) => updatePregunta(pIndex, 'texto_pregunta', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-medium"
                      rows={2}
                      placeholder="Ej: ¿Cuál es la capital de Francia?"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        📊 Tipo de Pregunta
                      </label>
                      <select
                        value={pregunta.tipo_pregunta}
                        onChange={(e) => updatePregunta(pIndex, 'tipo_pregunta', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold bg-white"
                      >
                        <option value="multiple">Opción Múltiple</option>
                        <option value="verdadero_falso">Verdadero/Falso</option>
                        <option value="abierta">Respuesta Abierta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        ⭐ Puntos
                      </label>
                      <input
                        type="number"
                        value={pregunta.puntos}
                        onChange={(e) => updatePregunta(pIndex, 'puntos', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 outline-none transition-all text-center font-bold text-lg"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Opciones de respuesta */}
                  {pregunta.tipo_pregunta !== 'abierta' && (
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700">
                          🎯 Opciones de Respuesta
                        </label>
                        <button
                          type="button"
                          onClick={() => addOpcion(pIndex)}
                          className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1 transition-colors border border-green-200"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar opción
                        </button>
                      </div>

                      {pregunta.opciones.map((opcion, oIndex) => (
                        <div
                          key={oIndex}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                            opcion.es_correcta
                              ? 'bg-green-50 border-green-300'
                              : 'bg-gray-50 border-gray-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => updateOpcion(pIndex, oIndex, 'es_correcta', !opcion.es_correcta)}
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              opcion.es_correcta
                                ? 'bg-green-500 shadow-md scale-110'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          >
                            {opcion.es_correcta ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : (
                              <X className="w-5 h-5 text-white" />
                            )}
                          </button>

                          <input
                            type="text"
                            value={opcion.texto_opcion}
                            onChange={(e) => updateOpcion(pIndex, oIndex, 'texto_opcion', e.target.value)}
                            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none font-medium"
                            placeholder={`Opción ${oIndex + 1}`}
                            required
                          />

                          <button
                            type="button"
                            onClick={() => removeOpcion(pIndex, oIndex)}
                            className="flex-shrink-0 bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors border border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      <p className="text-xs text-gray-600 italic mt-2 bg-blue-50 p-2 rounded-lg border border-blue-200">
                        💡 <strong>Tip:</strong> Marca la(s) respuesta(s) correcta(s) haciendo clic en el círculo
                      </p>
                    </div>
                  )}

                  {/* Explicación */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      💡 Explicación (opcional)
                    </label>
                    <textarea
                      value={pregunta.explicacion}
                      onChange={(e) => updatePregunta(pIndex, 'explicacion', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                      rows={2}
                      placeholder="Explica por qué esta es la respuesta correcta..."
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Botón agregar pregunta */}
            <button
              type="button"
              onClick={addPregunta}
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6" />
              Agregar Nueva Pregunta
            </button>
          </div>

          {/* Botón guardar */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-5 rounded-2xl font-black text-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Sparkles className="w-7 h-7" />
                {mode === 'edit' ? 'Actualizar Quiz' : 'Crear Quiz'}
                <Sparkles className="w-7 h-7" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
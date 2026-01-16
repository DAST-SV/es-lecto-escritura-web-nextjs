// app/[locale]/admin/route-translations/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { RouteGuard } from '@/src/presentation/components/RouteGuard';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface Route {
  id: string;
  pathname: string;
  display_name: string;
}

interface Translation {
  id: string;
  route_id: string;
  language_code: 'es' | 'en' | 'fr' | 'it';
  translated_path: string;
  translated_name: string;
  is_active: boolean;
  routes?: Route;
}

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
] as const;

export default function RouteTranslationsPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    route_id: '',
    language_code: 'es' as 'es' | 'en' | 'fr' | 'it',
    translated_path: '',
    translated_name: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    // Cargar rutas
    const { data: routesData } = await supabase
      .from('routes')
      .select('id, pathname, display_name')
      .is('deleted_at', null)
      .order('pathname');

    // Cargar traducciones
    const { data: translationsData } = await supabase
      .from('route_translations')
      .select(`
        *,
        routes:route_id (
          id,
          pathname,
          display_name
        )
      `)
      .order('language_code');

    setRoutes(routesData || []);
    setTranslations(translationsData || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    if (editingTranslation) {
      // Actualizar
      const { error } = await supabase
        .from('route_translations')
        .update({
          translated_path: formData.translated_path,
          translated_name: formData.translated_name,
        })
        .eq('id', editingTranslation.id);

      if (error) {
        console.error('Error updating translation:', error);
        alert('Error al actualizar traducción');
      } else {
        alert('Traducción actualizada exitosamente');
        resetForm();
        loadData();
      }
    } else {
      // Crear nueva
      const { error } = await supabase
        .from('route_translations')
        .insert([formData]);

      if (error) {
        console.error('Error creating translation:', error);
        alert('Error al crear traducción. Puede que ya exista para este idioma.');
      } else {
        alert('Traducción creada exitosamente');
        resetForm();
        loadData();
      }
    }
  };

  const handleEdit = (translation: Translation) => {
    setEditingTranslation(translation);
    setFormData({
      route_id: translation.route_id,
      language_code: translation.language_code,
      translated_path: translation.translated_path,
      translated_name: translation.translated_name,
    });
    setShowForm(true);
  };

  const handleDelete = async (translationId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta traducción?')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('route_translations')
      .delete()
      .eq('id', translationId);

    if (error) {
      console.error('Error deleting translation:', error);
      alert('Error al eliminar traducción');
    } else {
      alert('Traducción eliminada exitosamente');
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      route_id: '',
      language_code: 'es',
      translated_path: '',
      translated_name: '',
    });
    setEditingTranslation(null);
    setShowForm(false);
  };

  // Agrupar traducciones por ruta
  const groupedTranslations = routes.map((route) => ({
    route,
    translations: translations.filter((t) => t.route_id === route.id),
  }));

  return (
    <RouteGuard redirectTo="/error?code=403">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🌍 Traducciones de Rutas
            </h1>
            <p className="text-gray-600">
              Traducir rutas a diferentes idiomas (Script 04)
            </p>
          </div>

          {/* Botón Nueva Traducción */}
          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              {showForm ? '❌ Cancelar' : '➕ Nueva Traducción'}
            </button>
          </div>

          {/* Formulario */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {editingTranslation ? 'Editar Traducción' : 'Nueva Traducción'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ruta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ruta *
                    </label>
                    <select
                      required
                      disabled={!!editingTranslation}
                      value={formData.route_id}
                      onChange={(e) =>
                        setFormData({ ...formData, route_id: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    >
                      <option value="">Seleccionar ruta...</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.pathname} - {route.display_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Idioma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Idioma *
                    </label>
                    <select
                      required
                      disabled={!!editingTranslation}
                      value={formData.language_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          language_code: e.target.value as 'es' | 'en' | 'fr' | 'it',
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ruta Traducida */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ruta Traducida *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="/biblioteca"
                      value={formData.translated_path}
                      onChange={(e) =>
                        setFormData({ ...formData, translated_path: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Debe empezar con / (ejemplo: /biblioteca)
                    </p>
                  </div>

                  {/* Nombre Traducido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Traducido *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Biblioteca"
                      value={formData.translated_name}
                      onChange={(e) =>
                        setFormData({ ...formData, translated_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    {editingTranslation ? '💾 Guardar Cambios' : '➕ Crear Traducción'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Traducciones Agrupadas */}
          <div className="space-y-6">
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                Cargando...
              </div>
            ) : groupedTranslations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                No hay rutas registradas
              </div>
            ) : (
              groupedTranslations.map(({ route, translations: routeTranslations }) => (
                <div key={route.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Header de la ruta */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <code className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {route.pathname}
                        </code>
                        <span className="ml-3 text-gray-700">{route.display_name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {routeTranslations.length} traducciones
                      </span>
                    </div>
                  </div>

                  {/* Traducciones */}
                  {routeTranslations.length === 0 ? (
                    <div className="px-6 py-4 text-center text-gray-500 text-sm">
                      Sin traducciones
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                      {routeTranslations.map((translation) => {
                        const lang = LANGUAGES.find(
                          (l) => l.code === translation.language_code
                        );
                        return (
                          <div
                            key={translation.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{lang?.flag}</span>
                                <span className="font-medium text-gray-900">
                                  {lang?.name}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(translation)}
                                  className="text-indigo-600 hover:text-indigo-900 text-sm"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(translation.id)}
                                  className="text-red-600 hover:text-red-900 text-sm"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs text-gray-500">Ruta:</span>
                                <code className="block text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded mt-1">
                                  {translation.translated_path}
                                </code>
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Nombre:</span>
                                <p className="text-sm text-gray-900 mt-1">
                                  {translation.translated_name}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
// ============================================
// app/[locale]/admin/route-translations/page.tsx
// TRADUCCIONES DE RUTAS (como translations)
// ============================================
// Seleccionas una ruta → Traduces a idiomas
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { Plus, Edit2, Trash2, Globe, Search, Loader2, AlertCircle, Languages } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Route {
  id: string;
  pathname: string;
  display_name: string;
}

interface RouteTranslation {
  id: string;
  route_id: string;
  pathname: string;
  display_name: string;
  language_code: string;
  translated_path: string;
  translated_name: string;
}

export default function RouteTranslationsPage() {
  const supabase = createClient();
  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  ];

  const [routes, setRoutes] = useState<Route[]>([]);
  const [translations, setTranslations] = useState<RouteTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  // Modal states
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<RouteTranslation | null>(null);

  // Form states
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [translatedPath, setTranslatedPath] = useState('');
  const [translatedName, setTranslatedName] = useState('');

  /**
   * 📥 CARGAR RUTAS
   */
  const loadRoutes = async () => {
    try {
      const { data, error } = await supabase
        .schema('app')
        .from('routes')
        .select('id, pathname, display_name')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('pathname');

      if (error) throw error;
      setRoutes(data || []);
    } catch (err: any) {
      console.error('Error loading routes:', err);
    }
  };

  /**
   * 📥 CARGAR TRADUCCIONES
   */
  const loadTranslations = async () => {
    try {
      setLoading(true);

      const { data: translationsData, error: translationsError } = await supabase
        .schema('app')
        .from('route_translations')
        .select('*')
        .eq('is_active', true)
        .order('language_code');

      if (translationsError) throw translationsError;

      // Agregar info de la ruta
      const translationsWithRoute = await Promise.all(
        (translationsData || []).map(async (t: any) => {
          const { data: route } = await supabase
            .schema('app')
            .from('routes')
            .select('pathname, display_name')
            .eq('id', t.route_id)
            .single();

          return {
            ...t,
            pathname: route?.pathname || '',
            display_name: route?.display_name || '',
          };
        })
      );

      setTranslations(translationsWithRoute);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
    loadTranslations();
  }, []);

  /**
   * ✏️ ABRIR MODAL EDITAR
   */
  const handleOpenEdit = (translation: RouteTranslation) => {
    setSelectedTranslation(translation);
    setTranslatedPath(translation.translated_path);
    setTranslatedName(translation.translated_name);
    setShowEditModal(true);
  };

  /**
   * 🗑️ ABRIR MODAL ELIMINAR
   */
  const handleOpenDelete = (translation: RouteTranslation) => {
    setSelectedTranslation(translation);
    setShowDeleteModal(true);
  };

  /**
   * ➕ CREAR TRADUCCIÓN
   */
  const handleTranslate = async () => {
    try {
      if (!selectedRouteId || !translatedPath || !translatedName) {
        toast.error('Todos los campos son requeridos');
        return;
      }

      // Verificar si ya existe
      const { data: existing } = await supabase
        .schema('app')
        .from('route_translations')
        .select('id')
        .eq('route_id', selectedRouteId)
        .eq('language_code', selectedLanguage)
        .single();

      if (existing) {
        toast.error('Ya existe una traducción para este idioma');
        return;
      }

      const { error: insertError } = await supabase
        .schema('app')
        .from('route_translations')
        .insert({
          route_id: selectedRouteId,
          language_code: selectedLanguage,
          translated_path: translatedPath,
          translated_name: translatedName,
        });

      if (insertError) throw insertError;

      toast.success('✅ Traducción creada');
      setShowTranslateModal(false);
      resetForm();
      loadTranslations();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /**
   * ✏️ ACTUALIZAR TRADUCCIÓN
   */
  const handleUpdate = async () => {
    try {
      if (!translatedPath || !translatedName) {
        toast.error('Todos los campos son requeridos');
        return;
      }

      if (!selectedTranslation) return;

      const { error: updateError } = await supabase
        .schema('app')
        .from('route_translations')
        .update({
          translated_path: translatedPath,
          translated_name: translatedName,
        })
        .eq('id', selectedTranslation.id);

      if (updateError) throw updateError;

      toast.success('✅ Traducción actualizada');
      setShowEditModal(false);
      resetForm();
      loadTranslations();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /**
   * 🗑️ ELIMINAR TRADUCCIÓN
   */
  const handleDelete = async () => {
    try {
      if (!selectedTranslation) return;

      const { error: deleteError } = await supabase
        .schema('app')
        .from('route_translations')
        .delete()
        .eq('id', selectedTranslation.id);

      if (deleteError) throw deleteError;

      toast.success('✅ Traducción eliminada');
      setShowDeleteModal(false);
      setSelectedTranslation(null);
      loadTranslations();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /**
   * 🔄 RESETEAR FORMULARIO
   */
  const resetForm = () => {
    setSelectedRouteId('');
    setSelectedLanguage('es');
    setTranslatedPath('');
    setTranslatedName('');
    setSelectedTranslation(null);
  };

  /**
   * 🔍 FILTRAR TRADUCCIONES
   */
  const filteredTranslations = translations.filter(t => {
    const matchesSearch =
      t.pathname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.translated_path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.translated_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLanguage = filterLanguage === 'all' || t.language_code === filterLanguage;

    return matchesSearch && matchesLanguage;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando traducciones...</p>
        </div>
      </div>
    );
  }

  if (error && translations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Error al cargar</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={loadTranslations} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Traducciones de Rutas</h2>
          <p className="text-gray-600 mt-1">Traduce rutas a múltiples idiomas</p>
        </div>

        <button
          onClick={() => setShowTranslateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Traducir Ruta
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar traducciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los idiomas</option>
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta Original</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Idioma</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta Traducida</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Traducido</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTranslations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron traducciones
                </td>
              </tr>
            ) : (
              filteredTranslations.map((translation) => (
                <tr key={translation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <code className="text-sm font-mono text-gray-900">{translation.pathname}</code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg">
                        {languages.find(l => l.code === translation.language_code)?.flag}
                      </span>
                      <span className="font-semibold text-blue-600">
                        {translation.language_code.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm font-mono text-blue-800">{translation.translated_path}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-800">{translation.translated_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(translation)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(translation)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TRADUCIR */}
      {showTranslateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Traducir Ruta</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar Ruta *
                  </label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.id}>
                        {route.pathname} - {route.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma *
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruta Traducida *
                  </label>
                  <input
                    type="text"
                    value={translatedPath}
                    onChange={(e) => setTranslatedPath(e.target.value)}
                    placeholder="/biblioteca"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Traducido *
                  </label>
                  <input
                    type="text"
                    value={translatedName}
                    onChange={(e) => setTranslatedName(e.target.value)}
                    placeholder="Biblioteca"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleTranslate}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Traducción
                </button>
                <button
                  onClick={() => {
                    setShowTranslateModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditModal && selectedTranslation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Editar Traducción</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruta Original
                  </label>
                  <input
                    type="text"
                    value={selectedTranslation.pathname}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma
                  </label>
                  <input
                    type="text"
                    value={selectedTranslation.language_code.toUpperCase()}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ruta Traducida *
                  </label>
                  <input
                    type="text"
                    value={translatedPath}
                    onChange={(e) => setTranslatedPath(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Traducido *
                  </label>
                  <input
                    type="text"
                    value={translatedName}
                    onChange={(e) => setTranslatedName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {showDeleteModal && selectedTranslation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Eliminar Traducción</h3>
              <p className="text-gray-600 mb-6">
                ¿Eliminar la traducción <strong>{selectedTranslation.language_code.toUpperCase()}</strong> de <code className="font-mono">{selectedTranslation.pathname}</code>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedTranslation(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
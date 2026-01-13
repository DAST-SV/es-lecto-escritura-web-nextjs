// ============================================
// app/[locale]/admin/routes/page.tsx
// GESTIÓN DE RUTAS INTERNACIONALES
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  Save, 
  X,
  Map,
  Languages
} from 'lucide-react';

// ============================================
// TIPOS
// ============================================

type LanguageCode = 'es' | 'en' | 'fr' | 'it';

interface Translation {
  path: string;
  name: string;
}

interface Translations {
  [key: string]: Translation;
}

interface Route {
  id: string;
  pathname: string;
  display_name: string;
  icon?: string;
  show_in_menu: boolean;
  menu_order: number;
  translations: Translations;
}

interface FormData {
  pathname: string;
  display_name: string;
  icon: string;
  show_in_menu: boolean;
  menu_order: number;
  translations: {
    [K in LanguageCode]: Translation;
  };
}

// ============================================
// COMPONENTE
// ============================================

export default function RoutesManagementPage() {
  const supabase = createClient();
  const languages: LanguageCode[] = ['es', 'en', 'fr', 'it'];

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const [formData, setFormData] = useState<FormData>({
    pathname: '',
    display_name: '',
    icon: '',
    show_in_menu: true,
    menu_order: 0,
    translations: {
      es: { path: '', name: '' },
      en: { path: '', name: '' },
      fr: { path: '', name: '' },
      it: { path: '', name: '' },
    }
  });

  /**
   * 📥 CARGAR RUTAS
   */
  const loadRoutes = async () => {
    setLoading(true);
    try {
      const { data: routesData, error: routesError } = await supabase
        .schema('app')
        .from('routes')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('menu_order');

      if (routesError) throw new Error(routesError.message);

      const { data: translationsData, error: translationsError } = await supabase
        .schema('app')
        .from('route_translations')
        .select('*')
        .eq('is_active', true);

      if (translationsError) throw new Error(translationsError.message);

      const routesWithTranslations: Route[] = (routesData || []).map((route: any) => {
        const routeTranslations = (translationsData || []).filter(
          (t: any) => t.route_id === route.id
        );

        const translations: Translations = {};
        routeTranslations.forEach((t: any) => {
          translations[t.language_code] = {
            path: t.translated_path,
            name: t.translated_name
          };
        });

        return {
          id: route.id,
          pathname: route.pathname,
          display_name: route.display_name,
          icon: route.icon,
          show_in_menu: route.show_in_menu,
          menu_order: route.menu_order,
          translations
        };
      });

      setRoutes(routesWithTranslations);
    } catch (err: any) {
      alert('Error cargando rutas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  /**
   * ✏️ EDITAR
   */
  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      pathname: route.pathname,
      display_name: route.display_name,
      icon: route.icon || '',
      show_in_menu: route.show_in_menu,
      menu_order: route.menu_order,
      translations: {
        es: route.translations['es'] || { path: '', name: '' },
        en: route.translations['en'] || { path: '', name: '' },
        fr: route.translations['fr'] || { path: '', name: '' },
        it: route.translations['it'] || { path: '', name: '' },
      }
    });
    setShowForm(true);
  };

  /**
   * ➕ NUEVO
   */
  const handleNew = () => {
    setEditingRoute(null);
    setFormData({
      pathname: '',
      display_name: '',
      icon: '',
      show_in_menu: true,
      menu_order: routes.length + 1,
      translations: {
        es: { path: '', name: '' },
        en: { path: '', name: '' },
        fr: { path: '', name: '' },
        it: { path: '', name: '' },
      }
    });
    setShowForm(true);
  };

  /**
   * 💾 GUARDAR
   */
  const handleSave = async () => {
    try {
      if (!formData.pathname || !formData.display_name) {
        alert('Pathname y Display Name son requeridos');
        return;
      }

      if (editingRoute) {
        const { error: updateError } = await supabase
          .schema('app')
          .from('routes')
          .update({
            pathname: formData.pathname,
            display_name: formData.display_name,
            icon: formData.icon || null,
            show_in_menu: formData.show_in_menu,
            menu_order: formData.menu_order,
          })
          .eq('id', editingRoute.id);

        if (updateError) throw new Error(updateError.message);
        await updateTranslations(editingRoute.id);
      } else {
        const { data: newRoute, error: insertError } = await supabase
          .schema('app')
          .from('routes')
          .insert({
            pathname: formData.pathname,
            display_name: formData.display_name,
            icon: formData.icon || null,
            show_in_menu: formData.show_in_menu,
            menu_order: formData.menu_order,
          })
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        await updateTranslations(newRoute.id);
      }

      alert('✅ Ruta guardada correctamente');
      setShowForm(false);
      loadRoutes();
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    }
  };

  /**
   * 🌍 ACTUALIZAR TRADUCCIONES
   */
  const updateTranslations = async (routeId: string) => {
    await supabase
      .schema('app')
      .from('route_translations')
      .delete()
      .eq('route_id', routeId);

    const translations = [];
    for (const lang of languages) {
      if (formData.translations[lang].path && formData.translations[lang].name) {
        translations.push({
          route_id: routeId,
          language_code: lang,
          translated_path: formData.translations[lang].path,
          translated_name: formData.translations[lang].name,
        });
      }
    }

    if (translations.length > 0) {
      const { error } = await supabase
        .schema('app')
        .from('route_translations')
        .insert(translations);

      if (error) throw new Error(error.message);
    }
  };

  /**
   * 🗑️ ELIMINAR
   */
  const handleDelete = async (routeId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta ruta?')) return;

    try {
      const { error } = await supabase
        .schema('app')
        .from('routes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', routeId);

      if (error) throw new Error(error.message);

      alert('✅ Ruta eliminada');
      loadRoutes();
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Map className="text-blue-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestión de Rutas
                </h1>
                <p className="text-gray-600">
                  Crea y edita rutas con traducciones internacionales
                </p>
              </div>
            </div>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Nueva Ruta
            </button>
          </div>
        </div>

        {/* LISTA DE RUTAS */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono text-sm">
                        {route.pathname}
                      </code>
                      {route.icon && (
                        <span className="text-gray-500">{route.icon}</span>
                      )}
                      {route.show_in_menu && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          En menú
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {route.display_name}
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      {languages.map((lang) => (
                        <div key={lang} className="flex items-center gap-2">
                          <Languages size={14} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-500 uppercase w-6">
                            {lang}
                          </span>
                          {route.translations[lang] ? (
                            <code className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                              {route.translations[lang].path}
                            </code>
                          ) : (
                            <span className="text-xs text-gray-400">Sin traducción</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(route)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FORMULARIO MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRoute ? 'Editar Ruta' : 'Nueva Ruta'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pathname (clave interna) *
                    </label>
                    <input
                      type="text"
                      value={formData.pathname}
                      onChange={(e) => setFormData({ ...formData, pathname: e.target.value })}
                      placeholder="/my-route"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="My Route"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon (Lucide)
                      </label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="BookOpen"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Orden en menú
                      </label>
                      <input
                        type="number"
                        value={formData.menu_order}
                        onChange={(e) => setFormData({ ...formData, menu_order: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.show_in_menu}
                      onChange={(e) => setFormData({ ...formData, show_in_menu: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Mostrar en menú
                    </label>
                  </div>
                </div>

                {/* Traducciones */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe size={20} />
                    Traducciones
                  </h3>

                  <div className="space-y-4">
                    {languages.map((lang) => (
                      <div key={lang} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold text-gray-700 uppercase">
                            {lang === 'es' && '🇪🇸 Español'}
                            {lang === 'en' && '🇺🇸 English'}
                            {lang === 'fr' && '🇫🇷 Français'}
                            {lang === 'it' && '🇮🇹 Italiano'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Ruta traducida
                            </label>
                            <input
                              type="text"
                              value={formData.translations[lang].path}
                              onChange={(e) => setFormData({
                                ...formData,
                                translations: {
                                  ...formData.translations,
                                  [lang]: { ...formData.translations[lang], path: e.target.value }
                                }
                              })}
                              placeholder={`/mi-ruta-${lang}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Nombre traducido
                            </label>
                            <input
                              type="text"
                              value={formData.translations[lang].name}
                              onChange={(e) => setFormData({
                                ...formData,
                                translations: {
                                  ...formData.translations,
                                  [lang]: { ...formData.translations[lang], name: e.target.value }
                                }
                              })}
                              placeholder="Mi Ruta"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save size={20} />
                    Guardar
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
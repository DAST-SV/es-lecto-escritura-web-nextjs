
'use client';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { useLocale } from 'next-intl';
import { Link } from '@/src/infrastructure/config/routing.config';

export default function TestSupabasePage() {
  const { t, loading } = useSupabaseTranslations('test');
  const { t: tCommon } = useSupabaseTranslations('common');
  const locale = useLocale();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Cargando traducciones desde Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-black text-gray-900">
              {t('welcome')}
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Idioma:</span>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-bold">
                {locale.toUpperCase()}
              </span>
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-6">
            {t('description')}
          </p>

          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-8 py-4 rounded-xl hover:shadow-lg transition-all hover:scale-105">
            {t('button.start')}
          </button>
        </div>

        {/* Navegación común */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Navegación (namespace: common)
          </h2>
          <nav className="flex gap-4">
            <a href="#home" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
              {tCommon('nav.home')}
            </a>
            <a href="#about" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
              {tCommon('nav.about')}
            </a>
            <a href="#contact" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
              {tCommon('nav.contact')}
            </a>
          </nav>
        </div>

        {/* Arquitectura */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">🏛️ Arquitectura Limpia (DDD)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <h4 className="font-bold mb-2">🎯 Dominio</h4>
              <p className="text-sm">Entidades + Repositorios (interfaces)</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <h4 className="font-bold mb-2">🔧 Infraestructura</h4>
              <p className="text-sm">Implementación Supabase</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
              <h4 className="font-bold mb-2">🎨 Presentación</h4>
              <p className="text-sm">Hooks + Componentes React</p>
            </div>
          </div>
        </div>

        {/* Info técnica */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold mb-4">📊 Estado del Sistema</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Idioma:</span>
                <span className="text-green-400 font-mono">{locale}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fuente:</span>
                <span className="text-green-400 font-mono">Supabase</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Namespace test:</span>
                <span className="text-green-400 font-mono">✓ Activo</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Cache:</span>
                <span className="text-green-400 font-mono">✓ Memoria</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Arquitectura:</span>
                <span className="text-green-400 font-mono">DDD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Repository:</span>
                <span className="text-green-400 font-mono">Supabase</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cambiar idioma */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Cambiar Idioma
          </h3>
          <div className="flex gap-4 flex-wrap">
            <Link 
              href="/test-supabase" 
              locale="es"
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                locale === 'es' 
                  ? 'bg-blue-500 text-white shadow-lg scale-105' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              🇪🇸 Español
            </Link>
            <Link 
              href="/test-supabase" 
              locale="en"
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                locale === 'en' 
                  ? 'bg-blue-500 text-white shadow-lg scale-105' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              🇺🇸 English
            </Link>
            <Link 
              href="/test-supabase" 
              locale="fr"
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                locale === 'fr' 
                  ? 'bg-blue-500 text-white shadow-lg scale-105' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              🇫🇷 Français
            </Link>
          </div>
        </div>

        {/* Volver */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-block px-8 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
          >
            ← Volver al inicio
          </Link>
        </div>

      </div>
    </div>
  );
}
// ============================================
// PASO 7: Componente de prueba actualizado
// app/[locale]/test-supabase/page.tsx (actualizar imports)
// ============================================

'use client';
import { useTranslations } from 'next-intl'; // ✅ Cambiar a este
import { useLocale } from 'next-intl';
import { Link } from '@/src/infrastructure/config/routing.config';

export default function TestSupabasePage() {
  const t = useTranslations('test'); // ✅ Ahora carga desde Supabase
  const tCommon = useTranslations('common');
  const locale = useLocale();

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
            Navegación (desde Supabase)
          </h2>
          <nav className="flex gap-4">
            <Link href="/" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
              {tCommon('nav.home')}
            </Link>
            <Link href="/library" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
              Biblioteca
            </Link>
            <Link href="/my-world" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
              Mi Mundo
            </Link>
          </nav>
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

        {/* Estado */}
        <div className="bg-gray-900 text-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold mb-4">📊 Sistema Dinámico</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Fuente:</span>
                <span className="text-green-400 font-mono">✅ Supabase</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Traducciones:</span>
                <span className="text-green-400 font-mono">✅ Dinámicas</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Rutas:</span>
                <span className="text-green-400 font-mono">✅ Dinámicas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cache:</span>
                <span className="text-green-400 font-mono">✅ 5 min</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
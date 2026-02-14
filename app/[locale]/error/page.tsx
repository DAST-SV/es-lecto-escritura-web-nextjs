// ============================================
// app/[locale]/error/page.tsx
// ✅ CORREGIDO: router.push fuera del setState
// ============================================

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCurrentLocale } from '@/src/presentation/hooks';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useCurrentLocale();
  const [countdown, setCountdown] = useState(5);

  const code = searchParams.get('code') || '500';
  const message = searchParams.get('message') || 'Ha ocurrido un error';

  // ✅ FIX: Separar el countdown del redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ✅ FIX: Redirect en un useEffect separado
  useEffect(() => {
    if (countdown <= 0) {
      router.push(`/${locale}`);
    }
  }, [countdown, router]);

  const errorMessages: Record<string, { title: string; description: string; icon: string }> = {
    '403': {
      title: 'Acceso Denegado',
      description: 'No tienes permiso para acceder a esta página',
      icon: '🔒',
    },
    '404': {
      title: 'Página No Encontrada',
      description: 'La página que buscas no existe',
      icon: '🔍',
    },
    '500': {
      title: 'Error del Servidor',
      description: 'Algo salió mal en nuestro servidor',
      icon: '⚠️',
    },
  };

  const errorInfo = errorMessages[code] || errorMessages['500'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="text-6xl mb-4">{errorInfo.icon}</div>

          {/* Error Code */}
          <div className="text-8xl font-bold text-gray-200 mb-2">
            {code}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            {message || errorInfo.description}
          </p>

          {/* Countdown */}
          {countdown > 0 && (
            <div className="bg-indigo-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-indigo-900">
                Redirigiendo a inicio en{' '}
                <span className="font-bold text-indigo-600 text-lg">{countdown}</span>{' '}
                segundos...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/${locale}`)}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              🏠 Ir al Inicio Ahora
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              ← Volver Atrás
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Necesitas ayuda?{' '}
            <a
              href={`/${locale}/admin`}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Contactar soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
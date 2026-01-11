////////////////////////////////////////////
/// app/[locale]/forbidden/page.tsx
////////////////////////////////////////////
'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function ForbiddenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get('from') || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-md w-full">
        
        {/* Icono principal */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-lg text-gray-600">
            No tienes permisos para acceder a esta página
          </p>
        </div>

        {/* Información */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-semibold text-gray-500">Ruta solicitada:</span>
              <p className="text-sm text-gray-800 font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                {from}
              </p>
            </div>
            
            <div className="border-t pt-3">
              <p className="text-sm text-gray-700">
                Si crees que deberías tener acceso a esta página, contacta con tu administrador.
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver Atrás
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            <Home className="w-5 h-5" />
            Ir al Inicio
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Código de error: <span className="font-mono font-semibold">403 Forbidden</span>
          </p>
        </div>
      </div>
    </div>
  );
}
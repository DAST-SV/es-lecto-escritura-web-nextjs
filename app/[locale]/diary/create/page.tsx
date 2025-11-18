'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sun, Cloud, CloudRain, CloudSnow, Wind } from 'lucide-react';
import { useNuevaEntrada } from '@/src/components/components-for-diary/hooks/useDiario';
import { StepIndicator } from '@/src/components/components-for-diary/new-entrance/StepIndicator';
import { TituloStep } from '@/src/components/components-for-diary/new-entrance/TituloStep';
import { EmocionesStep } from '@/src/components/components-for-diary/new-entrance/EmocionesStep';
import { CalificacionStep } from '@/src/components/components-for-diary/new-entrance/CalificacionStep';
import { ClimaStep } from '@/src/components/components-for-diary/new-entrance/ClimaStep';
import { NavigationButtons } from '@/src/components/components-for-diary/new-entrance/NavigationButtons';
import { useNuevoDiarioForm } from '@/src/components/components-for-diary/hooks/useNuevoDiario';
import { ClimaOption, PasoInfo } from '@/src/typings/types-diary/types';

const CLIMAS: ClimaOption[] = [
  { nombre: 'Soleado', icon: Sun, color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-300' },
  { nombre: 'Nublado', icon: Cloud, color: 'bg-gray-50 hover:bg-gray-100 border-gray-300' },
  { nombre: 'Lluvioso', icon: CloudRain, color: 'bg-blue-50 hover:bg-blue-100 border-blue-300' },
  { nombre: 'Ventoso', icon: Wind, color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300' },
  { nombre: 'Frío', icon: CloudSnow, color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-300' }
];

const PASOS: PasoInfo[] = [
  { numero: 1, titulo: 'Título', descripcion: 'Dale un nombre a tu día' },
  { numero: 2, titulo: 'Emociones', descripcion: '¿Cómo te sentiste?' },
  { numero: 3, titulo: 'Calificación', descripcion: 'Evalúa tu día' },
  { numero: 4, titulo: 'Clima', descripcion: '¿Cómo estuvo el clima?' }
];

export default function NuevoDiarioPage() {
  const router = useRouter();
  const { crearEntrada, cargando, error: errorCreacion, setError: setErrorCreacion } = useNuevaEntrada();
  
  const {
    paso,
    titulo,
    setTitulo,
    clima,
    setClima,
    emociones,
    emocionesSeleccionadas,
    toggleEmocion,
    calificacion,
    setCalificacion,
    error,
    avanzarPaso,
    retrocederPaso,
    validarPasoActual
  } = useNuevoDiarioForm();

  const handleAvanzar = async () => {
    if (paso < 4) {
      avanzarPaso();
    } else {
      // Último paso - crear entrada
      const idEntrada = await crearEntrada({
        titulo,
        clima,
        emocionesSeleccionadas,
        calificacion
      });

      if (idEntrada) {
        router.push(`/diario/editor/${idEntrada}`);
      }
    }
  };

  const errorMostrar = error || errorCreacion;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-800 mb-2">
            📖 Nueva Entrada de Diario
          </h1>
          <p className="text-gray-600 text-lg font-semibold">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        {/* Indicador de pasos */}
        <StepIndicator pasos={PASOS} pasoActual={paso} />

        {/* Contenido principal */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-100 p-8">
          {errorMostrar && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl font-semibold">
              ⚠️ {errorMostrar}
            </div>
          )}

          {paso === 1 && (
            <TituloStep titulo={titulo} onTituloChange={setTitulo} />
          )}

          {paso === 2 && (
            <EmocionesStep
              emociones={emociones}
              emocionesSeleccionadas={emocionesSeleccionadas}
              onToggleEmocion={toggleEmocion}
            />
          )}

          {paso === 3 && (
            <CalificacionStep
              calificacion={calificacion}
              onCalificacionChange={setCalificacion}
            />
          )}

          {paso === 4 && (
            <ClimaStep
              climas={CLIMAS}
              climaSeleccionado={clima}
              onClimaChange={setClima}
            />
          )}

          <NavigationButtons
            paso={paso}
            cargando={cargando}
            onRetroceder={retrocederPaso}
            onAvanzar={handleAvanzar}
          />
        </div>

        {/* Info adicional */}
        <div className="mt-6 text-center">
          <p className="text-base text-gray-600 font-semibold">
            Paso {paso} de 4
          </p>
        </div>
      </div>
    </div>
  );
}
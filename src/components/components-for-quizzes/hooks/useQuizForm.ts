'use client';

import { useState, useEffect } from 'react';
import {
  CreateQuizData,
  CreatePreguntaData,
  CreateOpcionData,
} from '@/src/typings/types-quiz';
import {
  validateQuizComplete,
  showValidationErrors,
  calculateTotalPoints,
} from '@/src/components/components-for-quizzes/hooks/quiz-validation';

interface UseQuizFormProps {
  id_libro: string;
  id_actividad?: string; // Requerido en modo edit
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
}

interface UseQuizFormReturn {
  formData: CreateQuizData;
  setFormData: React.Dispatch<React.SetStateAction<CreateQuizData>>;
  loading: boolean;
  loadingData: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  addPregunta: () => void;
  removePregunta: (index: number) => void;
  updatePregunta: (index: number, field: keyof CreatePreguntaData, value: any) => void;
  addOpcion: (preguntaIndex: number) => void;
  removeOpcion: (preguntaIndex: number, opcionIndex: number) => void;
  updateOpcion: (preguntaIndex: number, opcionIndex: number, field: keyof CreateOpcionData, value: any) => void;
  totalPuntos: number;
  mode: 'create' | 'edit';
}

interface ApiQuizResponse {
  success: boolean;
  data?: {
    id_actividad: string;
    id_libro: string;
    titulo: string;
    descripcion: string | null;
    puntos_maximos: number;
    tiempo_limite: number | null;
    intentos_permitidos: number | null;
    preguntas: Array<{
      id_pregunta: string;
      texto_pregunta: string;
      tipo_pregunta: string;
      puntos: number;
      explicacion: string | null;
      orden: number;
      opciones: Array<{
        id_opcion: string;
        texto_opcion: string;
        es_correcta: boolean;
        orden: number;
      }>;
    }>;
  };
  error?: string;
}

interface ApiSaveResponse {
  success: boolean;
  message?: string;
  id_actividad?: string;
  error?: string;
}

const DEFAULT_QUIZ_DATA: Omit<CreateQuizData, 'id_libro'> = {
  titulo: '',
  descripcion: '',
  puntos_maximos: 100,
  preguntas: [
    {
      texto_pregunta: '',
      tipo_pregunta: 'multiple',
      puntos: 10,
      explicacion: '',
      opciones: [
        { texto_opcion: '', es_correcta: false, orden: 1 },
        { texto_opcion: '', es_correcta: false, orden: 2 },
      ],
    },
  ],
};

export function useQuizForm({
  id_libro,
  id_actividad,
  mode = 'create',
  onSuccess
}: UseQuizFormProps): UseQuizFormReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(mode === 'edit');
  const [formData, setFormData] = useState<CreateQuizData>({
    ...DEFAULT_QUIZ_DATA,
    id_libro,
  });

  // Cargar datos existentes si estamos en modo edición
  useEffect(() => {
    if (mode === 'edit') {
      if (!id_actividad) {
        console.error('❌ id_actividad es requerido en modo edit');
        setLoadingData(false);
        return;
      }
      loadQuizData();
    }
  }, [id_actividad, mode]);

  const loadQuizData = async (): Promise<void> => {
    if (!id_actividad) {
      console.error('❌ No se puede cargar quiz sin id_actividad');
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    try {
      // Usar id_actividad para cargar el quiz
      const response = await fetch(`/api/libros/actividades/quizzes/${id_actividad}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: ApiQuizResponse = await response.json();

      if (result.success && result.data) {
        setFormData({
          id_libro: result.data.id_libro,
          titulo: result.data.titulo,
          descripcion: result.data.descripcion || '',
          puntos_maximos: result.data.puntos_maximos,
          tiempo_limite: result.data.tiempo_limite || undefined,
          intentos_permitidos: result.data.intentos_permitidos || undefined,
          preguntas: result.data.preguntas.map((p) => ({
            texto_pregunta: p.texto_pregunta,
            tipo_pregunta: p.tipo_pregunta,
            puntos: p.puntos,
            explicacion: p.explicacion || '',
            opciones: p.opciones || [],
          })),
        });
      } else {
        alert('❌ No se pudo cargar el quiz para editar');
      }
    } catch (error) {
      console.error('Error al cargar quiz:', error);
      alert('Error al cargar el quiz');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Validación completa
    const validation = validateQuizComplete(formData);
    if (!validation.isValid) {
      showValidationErrors(validation.errors);
      return;
    }

    // Validación adicional para modo edit
    if (mode === 'edit' && !id_actividad) {
      alert('❌ Error: id_actividad es requerido para actualizar el quiz');
      return;
    }

    setLoading(true);
    try {
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const url =
        mode === 'edit'
          ? `/api/libros/${id_libro}/actividades/quizzes/${id_actividad}`
          : `/api/libros/${id_libro}/actividades/quizzes/quizzes`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result: ApiSaveResponse = await response.json();
      if (result.success) {
        alert(
          mode === 'edit'
            ? '✅ Quiz actualizado exitosamente'
            : '✅ Quiz creado exitosamente'
        );
        onSuccess?.();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el quiz');
    } finally {
      setLoading(false);
    }
  };

  const addPregunta = (): void => {
    setFormData({
      ...formData,
      preguntas: [
        ...formData.preguntas,
        {
          texto_pregunta: '',
          tipo_pregunta: 'multiple',
          puntos: 10,
          explicacion: '',
          opciones: [
            { texto_opcion: '', es_correcta: false, orden: 1 },
            { texto_opcion: '', es_correcta: false, orden: 2 },
          ],
        },
      ],
    });
  };

  const removePregunta = (index: number): void => {
    if (formData.preguntas.length === 1) {
      alert('⚠️ Debes mantener al menos una pregunta');
      return;
    }
    setFormData({
      ...formData,
      preguntas: formData.preguntas.filter((_, i) => i !== index),
    });
  };

  const updatePregunta = (
    index: number,
    field: keyof CreatePreguntaData,
    value: any
  ): void => {
    const newPreguntas = [...formData.preguntas];
    newPreguntas[index] = { ...newPreguntas[index], [field]: value };
    setFormData({ ...formData, preguntas: newPreguntas });
  };

  const addOpcion = (preguntaIndex: number): void => {
    const newPreguntas = [...formData.preguntas];
    const pregunta = newPreguntas[preguntaIndex];
    pregunta.opciones.push({
      texto_opcion: '',
      es_correcta: false,
      orden: pregunta.opciones.length + 1,
    });
    setFormData({ ...formData, preguntas: newPreguntas });
  };

  const removeOpcion = (preguntaIndex: number, opcionIndex: number): void => {
    const pregunta = formData.preguntas[preguntaIndex];
    if (pregunta.opciones.length <= 2) {
      alert('⚠️ Debes mantener al menos 2 opciones');
      return;
    }
    const newPreguntas = [...formData.preguntas];
    newPreguntas[preguntaIndex].opciones = newPreguntas[
      preguntaIndex
    ].opciones.filter((_, i) => i !== opcionIndex);
    setFormData({ ...formData, preguntas: newPreguntas });
  };

  const updateOpcion = (
    preguntaIndex: number,
    opcionIndex: number,
    field: keyof CreateOpcionData,
    value: any
  ): void => {
    const newPreguntas = [...formData.preguntas];
    newPreguntas[preguntaIndex].opciones[opcionIndex] = {
      ...newPreguntas[preguntaIndex].opciones[opcionIndex],
      [field]: value,
    };
    setFormData({ ...formData, preguntas: newPreguntas });
  };

  const totalPuntos = calculateTotalPoints(formData.preguntas);

  return {
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
    mode,
  };
}
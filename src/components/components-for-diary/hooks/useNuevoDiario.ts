
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/utils/supabase/utilsClient';
import { getCurrentUser } from '@/src/utils/supabase/utilsClient';
import {Emocion} from '@/src/typings/types-diary/types'

export const useNuevoDiarioForm = () => {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [titulo, setTitulo] = useState('');
  const [clima, setClima] = useState<string | null>(null);
  const [emociones, setEmociones] = useState<Emocion[]>([]);
  const [emocionesSeleccionadas, setEmocionesSeleccionadas] = useState<number[]>([]);
  const [calificacion, setCalificacion] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verificarSesion();
    cargarEmociones();
  }, []);

  const verificarSesion = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/login');
    }
  };

  const cargarEmociones = async () => {
    const { data } = await supabase
      .from('emociones')
      .select('*')
      .order('orden');
    
    if (data) setEmociones(data);
  };

  const toggleEmocion = (id: number) => {
    setEmocionesSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const validarPasoActual = (): boolean => {
    setError(null);
    
    if (paso === 2 && emocionesSeleccionadas.length === 0) {
      setError('Selecciona al menos una emoción');
      return false;
    }
    
    if (paso === 3 && calificacion === 0) {
      setError('Califica tu día con estrellas');
      return false;
    }
    
    return true;
  };

  const avanzarPaso = () => {
    if (validarPasoActual()) {
      setPaso(prev => prev + 1);
    }
  };

  const retrocederPaso = () => {
    if (paso > 1) {
      setPaso(prev => prev - 1);
      setError(null);
    }
  };

  return {
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
    setError,
    avanzarPaso,
    retrocederPaso,
    validarPasoActual
  };
};

'use client';

import { useParams, useRouter } from 'next/navigation';
import QuizForm from '@/src/components/components-for-quizzes/quizCRUD/QuizForm';

export default function CrearQuizPage() {
  const params = useParams();
  const router = useRouter();

  // 🔹 Extrae los IDs desde los parámetros de la URL
  const id_libro = params.id_libro as string;
  const id_actividad = params.id_actividad as string;

  // 🔹 Acción al guardar correctamente
  const handleSuccess = () => {
    router.push(`/Libros/${id_libro}/actividades`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <QuizForm id_libro={id_libro} id_actividad={id_actividad} mode="edit" onSuccess={handleSuccess} />
    </div>
  );
}

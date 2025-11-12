// app/libros/[id]/quiz/crear/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import QuizForm from '@/src/components/components-for-quizzes/quizCRUD/QuizForm';

export default function CrearQuizPage() {
  const params = useParams();
  const router = useRouter();
  const id_libro = params.id_libro as string;

  const handleSuccess = () => {
    router.push(`/Libros/${id_libro}/actividades`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <QuizForm id_libro={id_libro} mode='create' onSuccess={handleSuccess} />
    </div>
  );
}
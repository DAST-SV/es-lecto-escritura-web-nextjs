'use client';

import { Libro } from '@/src/typings/Libro';
import Image from 'next/image';
import Link from 'next/link';

interface LibroCardProps {
  libro: Libro;
}

export default function LibroCard({ libro }: LibroCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Link href={`/Libros/${libro.id_libro}/actividades`}>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-[420px] border border-sky-100 group">
        {/* Portada */}
        <div className="relative flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 h-52">
          {libro.portada ? (
            <Image
              src={libro.portada}
              alt={libro.titulo}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-20 h-20 text-sky-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 flex flex-col justify-between p-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
              {libro.titulo}
            </h3>

            {libro.descripcion && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{libro.descripcion}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {formatDate(libro.fecha_creacion)}
            </span>

            <span className="text-sky-600 font-medium group-hover:underline">
              Ver actividades →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import ImageGrid, { ImageItem } from "@/src/utils/imagenes/ImageGrid";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

const CreateBook: React.FC = () => {
  const acciones: ImageItem[] = [
    { src: "/Imagenes/create-libros/creatulibro.png", caption: "Crea tu libro", Json: "/es/interfaz-create-book" },
    { src: "/Imagenes/create-libros/editatuslibros.png", caption: "Edita tus libros", Json: "/es/edits-my-books" },
    { src: "/Imagenes/create-libros/papelera.png", caption: "Papelera", Json: "/es/delete-my-books" },
  ];

  const Banner: ImageItem[] = [
    { src: "/Imagenes/create-libros/Banner.png", caption: "Crea tu libro", Json: "/es/interfaz-create-book" },
  ];

  const guardarIdeas: ImageItem[] = [
    { src: "/Imagenes/create-libros/guardatusideas.png", caption: "Guarda tus ideas" },
    { src: "/Imagenes/create-libros/guardatusimagenes.png", caption: "Guarda tus imágenes" },
  ];

  return (
    <UnifiedLayout className="min-h-screen bg-gradient-to-b from-sky-200 via-blue-100 to-sky-300 px-6 py-10 flex flex-col items-center space-y-10">

      {/* Banner superior */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <ImageGrid
          images={Banner}
          shapeType={3}
          onClick={(img) =>
            window.location.href = `${img.Json?.toLowerCase().replace(/\s/g, "")}`
          }
        />
      </div>

      {/* Acciones principales */}
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <h2 className="text-center text-lg sm:text-xl font-bold text-sky-800 mb-4">
          ¿Qué quieres hacer?
        </h2>
        <ImageGrid
          images={acciones}
          shapeType={3}
          columns={3}
          onClick={(img) =>
            window.location.href = `${img.Json?.toLowerCase().replace(/\s/g, "")}`
          }
        />
      </div>

      {/* Botón de regreso */}
      <div className="w-full max-w-xl flex justify-center mt-6">
        <Link href="/pages-my-books">
          <button className="bg-sky-500 text-white px-6 py-3 rounded-2xl text-sm sm:text-base font-bold shadow-md hover:bg-sky-600 hover:scale-105 transition-all duration-300">
            ⬅ Regresar al menú de Lectoescritura
          </button>
        </Link>
      </div>
    </UnifiedLayout>
  );
};

export default CreateBook;

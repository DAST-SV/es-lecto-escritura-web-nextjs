"use client";

import React from "react";
import Link from "next/link";
import ImageGrid, { ImageItem } from "@/src/utils/imagenes/ImageGrid";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

const CreateBook: React.FC = () => {
  const acciones: ImageItem[] = [
    { src: "/Imagenes/create-libros/creatulibro.png", caption: "Crea tu libro",Json: "/es/interfaz-create-book" },
    { src: "/Imagenes/create-libros/editatuslibros.png", caption: "Edita tus libros", Json: "/es/edits-my-books"},
    { src: "/Imagenes/create-libros/papelera.png", caption: "Papelera", Json: "/es/delete-my-books"},
  ];

  const Banner: ImageItem[] = [
    { src: "/Imagenes/create-libros/Banner.png", caption: "Crea tu libro", Json: "/es/interfaz-create-book" },
  ];

  const guardarIdeas: ImageItem[] = [
    { src: "/Imagenes/create-libros/guardatusideas.png", caption: "Guarda tus ideas" },
    { src: "/Imagenes/create-libros/guardatusimagenes.png", caption: "Guarda tus imágenes" },
  ];

  return (
    <UnifiedLayout className="min-h-screen bg-gradient-to-b from-yellow-100 via-pink-100 to-blue-100 px-4 py-8 flex flex-col items-center space-y-6">


     <div className="max-w-4xl mx-auto px-4 mb-12">
        {/* Tercera sección: fila de 2 imágenes */}
        <ImageGrid
          images={Banner}
          shapeType={3}
          onClick={(img) =>
              window.location.href = `${img.Json?.toLowerCase().replace(/\s/g, "")}`
          }
        />
      </div>


      {/* Primera sección: fila de 2 imágenes */}
     <div className="max-w-4xl mx-auto px-4 mb-12">
          <ImageGrid
            images={acciones}
            shapeType={3}
            columns={3}
            onClick={(img) =>
              window.location.href = `${img.Json?.toLowerCase().replace(/\s/g, "")}`
            }
          />
      </div>

     <div className="max-w-4xl mx-auto px-4 mb-12">
        {/* Tercera sección: fila de 2 imágenes */}
        <ImageGrid
          images={guardarIdeas}
          shapeType={3}
          onClick={(img) => console.log(img.caption)}
        />
      </div>

      {/* Botón de regreso */}
      <div className="w-full max-w-xl flex justify-center mt-4">
        <Link href="/menu-lectoescritura">
          <button className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 text-xs sm:text-sm transition">
            Regresar al menú de LECTOESCRITURA
          </button>
        </Link>
      </div>
    </UnifiedLayout>
  );
};

export default CreateBook;

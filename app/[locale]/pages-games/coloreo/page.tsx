'use client'

import React, { useState } from "react";
import ImageGrid from "@/src/utils/imagenes/ImageGrid";
import PaintGame from "@/src/components/games/paint-game/PaintGame";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

const imagenes = [
  { src: "/Libros/El-Dragon-de-las-Nubes/Coloreable..svg", caption: "El dragon del cielo", description: "Un dragon muy amigable" },
  { src: "/Imagenes/Secciones_juegos/Colorea/Colorables/Patito-Feo.svg", caption: "El Patito Feo", description: "Dale color al patito más especial de todos." }
];

const imagenes2 = [
  { src: "/Imagenes/Secciones_juegos/Colorea/Colorables/La-Princesa-y-el-sapo.svg", caption: "La princesa y el sapo", description: "Colorea la mágica historia de la princesa y el sapo." },
  { src: "/Imagenes/Secciones_juegos/Colorea/Colorables/El-Principito.svg", caption: "El Principito", description: "Llena de color las aventuras del principito." },
  { src: "/Imagenes/Secciones_juegos/Colorea/Colorables/El-Mago-de-Oz.svg", caption: "El Mago de Oz", description: "Explora el mundo de Oz con tus colores favoritos." },
  { src: "/Imagenes/Secciones_juegos/Colorea/Colorables/Los-Tres-Cerditos.svg", caption: "Los Tres Cerditos", description: "Colorea las historias de los tres cerditos y el lobo." }
];

const Colorea: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<[string | null, string | null]>([null, null]);

  return (
    <UnifiedLayout className="flex flex-col min-h-screen bg-gradient-to-b from-yellow-100 via-pink-100 to-blue-100">

      {!selectedImages[0] && !selectedImages[1] &&(
        <>
          {/* Banner */}
          <div className="w-full max-w-6xl mx-auto mb-6 px-2 mt-2 md:mt-8 lg:mt-12">
            <img
              src="/Imagenes/Secciones_juegos/Colorea/Banner.jpg" 
              alt="Banner"
              className="w-full h-[200px] sm:h-[250px] md:h-[350px] lg:h-[450px] object-fill shadow-lg rounded-b-xl"
            />
          </div>
          
          {/* Títulos */}
          <h2 className="text-5xl text-center font-extrabold my-4 text-purple-700 drop-shadow-lg">
            Coloreos
          </h2>
          <h3 className="text-3xl text-center font-medium my-4 text-pink-600">
            ¡Colorea tus dibujos favoritos!
          </h3>

          {/* GALERÍA */}
          <div className="max-w-4xl mx-auto px-4 mb-12">
            <ImageGrid 
              images={imagenes} 
              shapeType={2} 
              onClick={(img) => setSelectedImages([typeof img.src === 'string' ? img.src : null, img.caption ?? null])}
            />
            <h3 className="text-3xl text-center font-bold my-6 text-blue-700">
              ¡Los dibujos más visitados!
            </h3>
            <ImageGrid 
              images={imagenes2} 
              shapeType={2} 
              onClick={(img) => setSelectedImages([typeof img.src === 'string' ? img.src : null, typeof img.caption === 'string' ? img.caption : null])}
            />
          </div>
        </>
      )}

      {/* Juego de coloreo */}
      {selectedImages[0] && selectedImages[1] && (
        <div className="mx-auto my-6">
          <PaintGame Url={selectedImages[0]} Name={selectedImages[1]} />
          <button 
            onClick={() => setSelectedImages([null,null])}
            className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Volver a la galería
          </button>
        </div>
      )}

    </UnifiedLayout>
  );
};

export default Colorea;

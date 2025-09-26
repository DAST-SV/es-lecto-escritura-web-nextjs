'use client'


import React, { useState } from "react";
import ImageGrid from "@/src/utils/imagenes/ImageGrid";
import QuizGame from "@/src/components/games/cuestionario/QuizGame"; // Aquí debe estar tu componente del quiz
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

const imagenes = [
  { src: "/Imagenes/Secciones_juegos/Quizes/Flautista.jpg", caption: "El flautista", description: "Pon a prueba tu memoria sobre el flautista y sus amigos." },
  { src: "/Imagenes/Secciones_juegos/Quizes/Rapunzel.jpg", caption: "Rapunzel", description: "Responde preguntas sobre la princesa de cabello largo." }
];

const imagenes2 = [
  { src: "/Imagenes/Secciones_juegos/Quizes/Caperucita.jpg", caption: "Caperucita Roja", description: "¿Recuerdas la historia del lobo y la abuelita?" },
  { src: "/Imagenes/Secciones_juegos/Quizes/Principito.jpg", caption: "El Principito", description: "Demuestra cuánto recuerdas del principito y sus planetas." },
  { src: "/Imagenes/Secciones_juegos/Quizes/Cerditos.jpg", caption: "Los Tres Cerditos", description: "Pon a prueba tu conocimiento sobre los cerditos y el lobo." }
];

const Quizes: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <UnifiedLayout className="flex flex-col min-h-screen bg-gradient-to-b from-purple-100 via-pink-100 to-yellow-100">

      {!selectedImage && (
        <>
          {/* Banner principal */}
          <div className="w-full max-w-6xl mx-auto mb-6 px-2 mt-2 md:mt-8 lg:mt-12">
            <img
              src="/Imagenes/Secciones_juegos/Quizes/Banner.jpg" 
              alt="Banner"
              className="w-full h-[200px] sm:h-[250px] md:h-[350px] lg:h-[450px] object-fill shadow-lg rounded-b-xl"
            />
          </div>

          {/* Títulos */}
          <h2 className="text-5xl text-center font-extrabold my-4 text-blue-700 drop-shadow-lg">
            Quizzes
          </h2>
          <h3 className="text-3xl text-center font-medium my-4 text-purple-600">
            ¡Responde preguntas y diviértete!
          </h3>

          {/* GALERÍA de quizzes */}
          <div className="max-w-4xl mx-auto px-4 mb-12">
            <ImageGrid 
              images={imagenes} 
              shapeType={3} 
              onClick={(img) => setSelectedImage(typeof img.src === 'string' ? img.src : null)}
            />
            <h3 className="text-3xl text-center font-bold my-6 text-green-700">
              ¡Los quizzes más jugados!
            </h3>
            <ImageGrid 
              images={imagenes2} 
              shapeType={3}  
              onClick={(img) => setSelectedImage(typeof img.src === 'string' ? img.src : null)}
            />
          </div>
        </>
      )}

      {/* Componente del Quiz */}
      {selectedImage && (
        <div className="mx-auto my-6">
          <QuizGame /> {/* Pasamos la imagen seleccionada si quieres */}
          <button 
            onClick={() => setSelectedImage(null)}
            className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Volver a la galería
          </button>
        </div>
      )}

    </UnifiedLayout>
  );
};

export default Quizes;

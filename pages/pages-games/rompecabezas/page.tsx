'use client'

import React, { useState } from "react"; 
import ImageGrid from "@/../utils/imagenes/ImageGrid";
import RealJigsawPuzzle from "../../games/rompe-cabezas/RealJigsawPuzzle"; // tu componente del puzzle

const imagenes = [
  { src: "/Libros/El-Dragon-de-las-Nubes/Rompecabezas.jpg", caption: "El dragon del cielo", description: "Un dragon muy amigable" },
  { src: "/Imagenes/Secciones_juegos/Rompecabezas/El_Patito_feo.jpg", caption: "El Patito Feo", description: "Completa el rompecabezas del patito y descubre su transformación." }
];

const imagenes2 = [
  { src: "/Imagenes/Secciones_juegos/Rompecabezas/La_Princesa_Y_El_Sapo.jpg", caption: "La princesa y el sapo", description: "Arma el rompecabezas de la princesa y su amigo sapo." },
  { src: "/Imagenes/Secciones_juegos/Rompecabezas/El_Principito.jpg", caption: "El Principito", description: "Completa las piezas del principito y sus aventuras." },
  { src: "/Imagenes/Secciones_juegos/Rompecabezas/EL_Mago_De_Oz.jpg", caption: "El Mago de Oz", description: "Arma a Dorothy y sus amigos en el camino de ladrillos amarillos." },
  { src: "/Imagenes/Secciones_juegos/Rompecabezas/Los_Tres_Cerditos.jpg", caption: "Los Tres Cerditos", description: "Completa el rompecabezas de los cerditos antes de que llegue el lobo." }
];

const RompeCabezas: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (imgSrc: string) => {
    setSelectedImage(imgSrc);
  };

  const handleClosePuzzle = () => {
    setSelectedImage(null); // volver a galería
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-yellow-100 via-pink-100 to-purple-100">

      {!selectedImage && (
        <>
          {/* Banner principal */}
          <div className="w-300 mx-auto mb-6">
            <img 
              src="/Imagenes/Secciones_juegos/Rompecabezas/Rompecabezas_Banner.jpg" 
              alt="Banner" 
              className="w-full max-h-85 h-auto shadow-lg rounded-b-xl"
            />
          </div>

          {/* Títulos */}
          <h2 className="text-5xl text-center font-extrabold my-4 text-red-700 drop-shadow-lg">
            Rompe Cabezas
          </h2>
          <h3 className="text-3xl text-center font-medium my-4 text-blue-700">
            ¡Disfruta armando tus personajes favoritos!
          </h3>

          {/* GALERÍA */}
          <div className="max-w-4xl mx-auto px-4 mb-12">
            <ImageGrid images={imagenes} shapeType={2} onClick={(img) => handleImageClick(img.src)}/>
            <h3 className="text-3xl text-center font-bold my-6 text-green-700">
              ¡Mira los rompecabezas más armados!
            </h3>
            <ImageGrid images={imagenes2} shapeType={2} onClick={(img) => handleImageClick(img.src)} />
          </div>
        </>
      )}

      {selectedImage && (
        console.log("entro"+selectedImage),
        <div className="mx-auto my-6 text-center">
          <RealJigsawPuzzle Url={selectedImage} />
          <button 
            onClick={handleClosePuzzle} 
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Volver a la galería
          </button>
        </div>
      )}
    </div>
  );
};

export default RompeCabezas;

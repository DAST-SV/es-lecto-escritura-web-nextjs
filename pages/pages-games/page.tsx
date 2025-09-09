import React from "react";
import Link from "next/link";
import '@/app/globals.css'; // CSS global


interface Juego {
  src: string;
  alt: string;
  route: string;
  description: string;
}

const juegos: Juego[] = [
  { 
    src: "/Imagenes/Secciones_juegos/Rompe-cabezas.jpg", 
    alt: "Rompe Cabezas", 
    route: "../../pages/pages-games/rompecabezas",
    description: "Ejercita tu mente resolviendo divertidos rompecabezas 🧩"
  },
  { 
    src: "/Imagenes/Secciones_juegos/Quizes.jpg", 
    alt: "Quizes", 
    route: "../../pages/pages-games/quizes",
    description: "Pon a prueba tus conocimientos con quizzes interactivos 🎓"
  },
  { 
    src: "/Imagenes/Secciones_juegos/Laberinto.jpg", 
    alt: "Laberinto", 
    route: "../../pages/pages-games/laberinto",
    description: "Encuentra la salida en emocionantes laberintos 🌀"
  },
  { 
    src: "/Imagenes/Secciones_juegos/Colorea.jpg", 
    alt: "Colorea", 
    route: "../../pages/pages-games/coloreo",
    description: "Da rienda suelta a tu creatividad coloreando dibujos 🎨"
  },
];

const SeccionJuegos: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-100 via-yellow-100 to-pink-100">

      {/* Banner principal */}
      <div className="w-full mb-6">
        <img 
          src="/Imagenes/Seccion_de_juegos.jpg" 
          alt="Banner" 
          className="w-full max-h-85 h-auto shadow-lg rounded-b-xl"
        />
      </div>

      {/* Título de sección */}
      <h2 className="text-4xl font-extrabold text-center text-purple-700 drop-shadow-lg mb-6">
        ¡Explora nuestros juegos!
      </h2>
      <p className="text-center text-lg text-pink-600 mb-8">
        Aprende y diviértete con actividades interactivas. 🎮✨
      </p>

      {/* Grid de juegos */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {juegos.map((juego) => (
          <Link  href={juego.route}>
            <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-3 hover:scale-105 transition-transform duration-300">
              <img
                src={juego.src}
                alt={juego.alt}
                className="w-full h-48 object-cover rounded-lg mb-2"
              />
              <h3 className="font-semibold text-purple-700">{juego.alt}</h3>
              <p className="text-sm text-gray-600 text-center">{juego.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SeccionJuegos;

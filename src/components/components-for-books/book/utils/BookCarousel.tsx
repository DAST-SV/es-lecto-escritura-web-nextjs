"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LibroUI {
  Json: string;
  src: string;
  caption: string;
  description?: string;
}

interface BookCarouselProps {
  libros: LibroUI[];
  onSelect: (book: LibroUI) => void;
}

const BookCarousel: React.FC<BookCarouselProps> = ({ libros, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      containerRef.current.scrollBy({
        left: dir === "left" ? -width : width,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full h-[65vh] overflow-hidden bg-gradient-to-br from-sky-100 via-blue-200 to-sky-300 rounded-3xl shadow-lg">
      {/* Contenedor scrollable */}
      <div
        ref={containerRef}
        className="flex flex-nowrap h-full snap-x snap-mandatory overflow-x-hidden scroll-smooth rounded-3xl"
      >
        {libros.map((book, i) => (
          <motion.div
            key={i}
            className="flex-shrink-0 w-full h-full flex items-center justify-center snap-center relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="flex flex-col md:flex-row items-center gap-8 px-6 max-w-5xl">
              {/* Portada */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 150 }}
                className="relative w-64 h-80 shadow-xl rounded-2xl overflow-hidden bg-white ring-4 ring-sky-300"
              >
                <Image
                  src={book.src}
                  alt={book.caption}
                  fill
                  className="object-cover rounded-2xl"
                />
              </motion.div>

              {/* Texto */}
              <div className="text-center md:text-left max-w-md">
                <h2 className="text-4xl font-extrabold text-blue-900 drop-shadow mb-4">
                  {book.caption}
                </h2>
                <p className="text-base text-blue-700 leading-relaxed mb-6">
                  {book.description ||
                    "Un cuento mágico lleno de aventuras y sonrisas."}
                </p>
                <button
                  onClick={() => onSelect(book)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white font-bold text-lg rounded-full shadow-md hover:scale-105 transition-transform"
                >
                  📖 Leer este cuento
                </button>
              </div>
            </div>

            {/* Decoración simple */}
            <motion.div
              className="absolute top-8 left-12 w-14 h-14 bg-yellow-300 rounded-full opacity-60"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-10 right-14 w-16 h-16 bg-cyan-300 rounded-full opacity-50"
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        ))}
      </div>

      {/* Botones de desplazamiento */}
      <button
        onClick={() => scroll("left")}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 text-blue-600 hover:bg-sky-200 p-3 rounded-full shadow-lg transition-transform hover:scale-110"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/90 text-blue-600 hover:bg-sky-200 p-3 rounded-full shadow-lg transition-transform hover:scale-110"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
};

export default BookCarousel;

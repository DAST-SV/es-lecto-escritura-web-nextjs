import React from 'react';
import { BookOpen, User, Award, Tag, Star, Users } from 'lucide-react';

interface LiteraryCardViewProps {
    backgroundUrl: string | null;
    titulo: string;
    autores: string[];
    personajes: string[];
    descripcion: string;
    categorias: string[];
    generos: string[];
    etiquetas: string[]; // ✅ AÑADIDO
    valores: string[];
    nivel: string | null;
}

export default function LiteraryCardView({
    backgroundUrl = null,
    titulo = "El Principito",
    autores = ["Antoine de Saint-Exupéry"],
    personajes = ["El Principito", "El Zorro", "La Rosa"],
    descripcion = "Un viaje filosófico a través de diferentes planetas donde un pequeño príncipe aprende valiosas lecciones sobre la vida, el amor y la amistad. Una obra atemporal que nos recuerda la importancia de ver con el corazón.",
    categorias = ["Ficción", "Filosofía"],
    generos = ["Fábula", "Aventura"],
    etiquetas = [], // ✅ AÑADIDO
    valores = ["Amistad", "Amor", "Responsabilidad"],
    nivel = "Infantil 8-12 años"
}: LiteraryCardViewProps) {

    const truncateWords = (text: string, maxChars: number) => {
        if (!text || text.length <= maxChars) return text;
        const truncated = text.substring(0, maxChars);
        const lastSpace = truncated.lastIndexOf(' ');
        return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <div className="w-full max-w-3xl h-[70vh] max-h-[550px]">
                {/* Card Container - SIN SCROLL */}
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200 h-full">
                    <div className="grid grid-cols-2 h-full">

                        {/* COLUMNA IZQUIERDA: Imagen (45%) */}
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            {backgroundUrl ? (
                                <img
                                    src={backgroundUrl}
                                    alt="Fondo de ficha"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400 p-6">
                                    <BookOpen size={48} className="mb-3 opacity-50" />
                                    <p className="text-sm font-medium text-center">
                                        Sin imagen de fondo
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* COLUMNA DERECHA: Información (55%) - CONTENIDO FIJO */}
                        <div className="flex flex-col h-full p-4">
                            {/* Header Fijo */}
                            <div className="flex-shrink-0 mb-3">
                                {/* Título */}
                                <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 mb-2">
                                    {titulo || 'Título del libro'}
                                </h3>

                                {/* Autores + Nivel en la misma línea */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    {autores.length > 0 && (
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                            <User size={12} className="text-indigo-600 flex-shrink-0" />
                                            <p className="text-[11px] font-medium text-gray-700 truncate">
                                                {autores.slice(0, 2).join(', ')}
                                                {autores.length > 2 && ` +${autores.length - 2}`}
                                            </p>
                                        </div>
                                    )}

                                    {nivel && (
                                        <span className="text-[9px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0">
                                            🏆 {nivel}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Descripción - Scroll Interno si es necesario */}
                            {descripcion && (
                                <div className="flex-shrink-0 mb-3">
                                    <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-800">
                                        {truncateWords(descripcion, 800)}
                                    </p>
                                </div>
                            )}

                            {/* Tags Section - COMPACTO Y HORIZONTAL */}
                            <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-y-auto">
                                
                                {/* Categorías - HORIZONTAL */}
                                {categorias.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Tag size={11} className="text-blue-600" />
                                            <span className="text-[9px] font-semibold text-gray-700">Tipo:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                                            {categorias.slice(0, 2).map((cat, idx) => (
                                                <span
                                                    key={`cat-${idx}`}
                                                    className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                                                >
                                                    {cat}
                                                </span>
                                            ))}
                                            {categorias.length > 2 && (
                                                <span className="text-[9px] text-blue-600 font-medium">
                                                    +{categorias.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Géneros - HORIZONTAL */}
                                {generos.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Star size={11} className="text-purple-600" />
                                            <span className="text-[9px] font-semibold text-gray-700">Géneros:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                                            {generos.slice(0, 2).map((gen, idx) => (
                                                <span
                                                    key={`gen-${idx}`}
                                                    className="text-[9px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                                                >
                                                    {gen}
                                                </span>
                                            ))}
                                            {generos.length > 2 && (
                                                <span className="text-[9px] text-purple-600 font-medium">
                                                    +{generos.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Personajes - HORIZONTAL */}
                                {personajes.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Users size={11} className="text-orange-600" />
                                            <span className="text-[9px] font-semibold text-gray-700">Personajes:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                                            {personajes.slice(0, 3).map((per, idx) => (
                                                <span
                                                    key={`per-${idx}`}
                                                    className="text-[9px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                                                >
                                                    {per}
                                                </span>
                                            ))}
                                            {personajes.length > 3 && (
                                                <span className="text-[9px] text-orange-600 font-medium">
                                                    +{personajes.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ✅ ETIQUETAS - HORIZONTAL */}
                                {etiquetas.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Tag size={11} className="text-pink-600" />
                                            <span className="text-[9px] font-semibold text-gray-700">Etiquetas:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                                            {etiquetas.slice(0, 3).map((etiq, idx) => (
                                                <span
                                                    key={`etiq-${idx}`}
                                                    className="text-[9px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                                                >
                                                    {etiq}
                                                </span>
                                            ))}
                                            {etiquetas.length > 3 && (
                                                <span className="text-[9px] text-pink-600 font-medium">
                                                    +{etiquetas.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Valores - HORIZONTAL */}
                                {valores.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Award size={11} className="text-green-600" />
                                            <span className="text-[9px] font-semibold text-gray-700">Valores:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                                            {valores.slice(0, 3).map((val, idx) => (
                                                <span
                                                    key={`val-${idx}`}
                                                    className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                                                >
                                                    {val}
                                                </span>
                                            ))}
                                            {valores.length > 3 && (
                                                <span className="text-[9px] text-green-600 font-medium">
                                                    +{valores.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nota informativa FUERA del card */}
                <div className="mt-2 text-center">
                    <p className="text-[10px] text-gray-500">
                        📌 Tarjeta que se mostrará en catálogos y búsquedas
                    </p>
                </div>
            </div>
        </div>
    );
}
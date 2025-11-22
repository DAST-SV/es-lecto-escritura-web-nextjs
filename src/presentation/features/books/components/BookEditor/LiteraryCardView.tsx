/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/LiteraryCardView.tsx
 * MEJORADO: Más compacta, con personajes, descripción limitada y sin márgenes excesivos
 */

'use client';

import React from 'react';
import { BookOpen, User, Award, Tag, Star, Users } from 'lucide-react';

interface LiteraryCardViewProps {
    backgroundUrl: string | null;
    titulo: string;
    autores: string[];
    personajes: string[]; // ⭐ AÑADIDO
    descripcion: string;
    categorias: string[];
    generos: string[];
    valores: string[];
    nivel: string | null;
}

export function LiteraryCardView({
    backgroundUrl,
    titulo,
    autores,
    personajes, // ⭐ AÑADIDO
    descripcion,
    categorias,
    generos,
    valores,
    nivel,
}: LiteraryCardViewProps) {

    // Truncar texto sin cortar palabras
    const truncateWords = (text: string, maxChars: number) => {
        if (!text || text.length <= maxChars) return text;

        const truncated = text.substring(0, maxChars);
        const lastSpace = truncated.lastIndexOf(' ');

        return lastSpace > 0
            ? truncated.substring(0, lastSpace) + '...'
            : truncated + '...';
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-gray-200">
                    <div className="grid grid-cols-2 gap-0" style={{ height: '420px' }}>

                        {/* COLUMNA IZQUIERDA: Imagen (50%) */}
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            {backgroundUrl ? (
                                <img
                                    src={backgroundUrl}
                                    alt="Fondo de ficha"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400 p-6">
                                    <BookOpen size={40} className="mb-2 opacity-50" />
                                    <p className="text-xs font-medium text-center">
                                        Sin imagen de fondo
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* COLUMNA DERECHA: Información (50%) - SCROLL */}
                        <div className="p-3 overflow-y-auto">
                            <div className="space-y-2">

                                {/* Título */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                                        {titulo || 'Título del libro'}
                                    </h3>
                                </div>

                                {/* Autores */}
                                {autores.length > 0 && (
                                    <div className="flex items-start gap-1.5">
                                        <User size={12} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-[10px] font-medium text-gray-700 line-clamp-1">
                                            {autores.slice(0, 2).join(', ')}
                                            {autores.length > 2 && ` +${autores.length - 2}`}
                                        </div>
                                    </div>
                                )}

                                {/* Nivel */}
                                {nivel && (
                                    <div className="flex items-center gap-1.5">
                                        <Award size={10} className="text-yellow-600 flex-shrink-0" />
                                        <span className="text-[9px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full font-medium">
                                            {nivel}
                                        </span>
                                    </div>
                                )}

                                {/* Descripción (LIMITADA y con word-wrap) */}
                                {descripcion && (
                                    <div>
                                        <p
                                            className="text-[10px] text-gray-600 leading-relaxed break-words"
                                            style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 12,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                wordBreak: 'break-word',
                                                overflowWrap: 'break-word',
                                                hyphens: 'auto'
                                            }}
                                        >
                                            {truncateWords(descripcion, 800)}
                                        </p>
                                    </div>
                                )}

                                {/* Personajes */}
                                {personajes.length > 0 && (
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1">
                                            <Users size={10} className="text-orange-600" />
                                            <span className="text-[9px] font-semibold text-gray-700">Personajes:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {personajes.slice(0, 3).map((per, idx) => (
                                                <span
                                                    key={`per-${idx}`}
                                                    className="text-[9px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full font-medium"
                                                >
                                                    {per}
                                                </span>
                                            ))}
                                            {personajes.length > 3 && (
                                                <span className="text-[9px] text-orange-600 font-medium px-1">
                                                    +{personajes.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Categorías */}
                                {categorias.length > 0 && (
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1">
                                            <Tag size={10} className="text-blue-600" />
                                            <span className="text-[9px] font-semibold text-gray-700">Tipo:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {categorias.map((cat, idx) => (
                                                <span
                                                    key={`cat-${idx}`}
                                                    className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-medium"
                                                >
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Géneros */}
                                {generos.length > 0 && (
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1">
                                            <Star size={10} className="text-purple-600" />
                                            <span className="text-[9px] font-semibold text-gray-700">Géneros:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {generos.slice(0, 2).map((gen, idx) => (
                                                <span
                                                    key={`gen-${idx}`}
                                                    className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full font-medium"
                                                >
                                                    {gen}
                                                </span>
                                            ))}
                                            {generos.length > 2 && (
                                                <span className="text-[9px] text-purple-600 font-medium px-1">
                                                    +{generos.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Valores */}
                                {valores.length > 0 && (
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-1">
                                            <Award size={10} className="text-green-600" />
                                            <span className="text-[9px] font-semibold text-gray-700">Valores:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {valores.slice(0, 3).map((val, idx) => (
                                                <span
                                                    key={`val-${idx}`}
                                                    className="text-[9px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-medium"
                                                >
                                                    {val}
                                                </span>
                                            ))}
                                            {valores.length > 3 && (
                                                <span className="text-[9px] text-green-600 font-medium px-1">
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

                {/* Nota informativa (más compacta) */}
                <div className="mt-2 text-center">
                    <p className="text-[10px] text-gray-500">
                        📌 Tarjeta que se mostrará en catálogos y búsquedas
                    </p>
                </div>
            </div>
        </div>
    );
}
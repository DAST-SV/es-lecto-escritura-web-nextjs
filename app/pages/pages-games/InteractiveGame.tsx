// src/components/InteractiveGame.tsx
import React, { useState } from "react";

interface Props {
  type: string; // ej. "clickStars"
  items: string[];
}

/**
 * Implementación mínima de juegos. Ampliable.
 * Actualmente soporta "clickStars" (incrementar score al click)
 */
export const InteractiveGame: React.FC<Props> = ({ type, items }) => {
  const [score, setScore] = useState(0);

  if (type === "clickStars") {
    return (
      <div className="flex flex-col items-center">
        <div className="flex gap-6 mb-3">
          {items.map((it, idx) => (
            <button
              key={idx}
              onClick={() => setScore(s => s + 1)}
              className="text-4xl"
              aria-label={`item-${idx}`}
            >
              {it}
            </button>
          ))}
        </div>
        <div className="text-lg font-semibold">Puntos: {score}</div>
      </div>
    );
  }

  // Fallback: render items simples
  return (
    <div className="flex gap-4">
      {items.map((it, i) => (
        <div key={i} className="bg-gray-200 px-3 py-2 rounded">
          {it}
        </div>
      ))}
    </div>
  );
};

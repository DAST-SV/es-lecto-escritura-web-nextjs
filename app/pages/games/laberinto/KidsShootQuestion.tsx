import React, { useState, useEffect } from "react";

export interface PreguntaObj {
  Pregunta: string;
  Respuesta1: string;
  Respuesta2: string;
  Respuesta3: string;
  Correcta: string;
}

interface ShootQuestionProps {
  pregunta: PreguntaObj;
  onClose: () => void;
}

const KidsShootQuestion: React.FC<ShootQuestionProps> = ({ pregunta, onClose }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0); 
  const [showResult, setShowResult] = useState(false);

  const respuestas = [pregunta.Respuesta1, pregunta.Respuesta2, pregunta.Respuesta3];

  // ⏱ Duración configurable de las animaciones de resultado
  const celebrationDuration = 500; // ms (1.2 segundos)

  // Bloquear scroll mientras el modal está activo
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; 
    return () => {
      document.body.style.overflow = originalOverflow; 
    };
  }, []);

  // Manejo de teclado ↑ ↓ Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResult) return;

      if (e.key === "ArrowUp") {
        setHighlightedIndex((prev) => (prev - 1 + respuestas.length) % respuestas.length);
      } else if (e.key === "ArrowDown") {
        setHighlightedIndex((prev) => (prev + 1) % respuestas.length);
      } else if (e.key === "Enter") {
        handleAnswer(respuestas[highlightedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [highlightedIndex, showResult, respuestas]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);

    setTimeout(() => {
      onClose();
      setSelectedAnswer(null);
      setShowResult(false);
      setHighlightedIndex(0);
    }, celebrationDuration); // 👈 usa la variable global
  };

  const isCorrect = selectedAnswer === pregunta.Correcta;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      background: "transparent"
    }}>
      {/* Contenedor del modal */}
      <div style={{
        position: "relative",
        background: "linear-gradient(135deg, #89f7fe, #66a6ff)",
        padding: "35px",
        borderRadius: "20px",
        maxWidth: "600px",
        width: "90%",
        textAlign: "center",
        boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
        border: "4px solid #fff",
        overflow: "hidden",
        animation: "zoomIn 0.4s ease-out"
      }}>
        {/* Decoraciones dentro del modal */}
        <div className="float-emoji" style={{ top: "10%", left: "-10%" }}>🎈</div>
        <div className="float-emoji" style={{ top: "20%", right: "-10%" }}>⭐</div>
        <div className="float-emoji" style={{ bottom: "10%", left: "-8%" }}>🌈</div>
        <div className="float-emoji" style={{ bottom: "20%", right: "-8%" }}>🦄</div>

        {!showResult ? (
          <>
            <h2 style={{ fontSize: "1.8rem", color: "#333", marginBottom: "25px" }}>
              🤔 {pregunta.Pregunta}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {respuestas.map((respuesta, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(respuesta)}
                  style={{
                    padding: "18px 20px",
                    borderRadius: "12px",
                    border: highlightedIndex === index ? "3px solid yellow" : "none",
                    background: highlightedIndex === index
                      ? "linear-gradient(135deg, #ff9a9e, #fad0c4)"
                      : "linear-gradient(135deg, #84fab0, #8fd3f4)",
                    color: "#fff",
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "0.2s",
                    boxShadow: highlightedIndex === index
                      ? "0 8px 20px rgba(0,0,0,0.3)"
                      : "0 5px 10px rgba(0,0,0,0.2)"
                  }}
                >
                  {getEmoji(index)} {respuesta}
                </button>
              ))}
            </div>

            <p style={{ marginTop: "20px", color: "white", fontSize: "1.1rem" }}>
              Usa ⬆️ ⬇️ y Enter para responder
            </p>
          </>
        ) : (
          <div>
            <div style={{
              fontSize: "3rem",
              marginBottom: "15px",
              animation: isCorrect
                ? `bounce ${celebrationDuration / 1000}s ease-out infinite alternate`
                : `shake ${celebrationDuration / 1000}s ease-out`
            }}>
              {isCorrect ? "🎉" : "😅"}
            </div>
            <h2 style={{ color: "white" }}>
              {isCorrect ? "¡Correcto! 🌟" : `La respuesta era: ${pregunta.Correcta}`}
            </h2>
          </div>
        )}
      </div>

      <style>
        {`
          .float-emoji {
            position: absolute;
            font-size: 2rem;
            opacity: 0.8;
            animation: float 4s ease-in-out infinite;
          }

          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }

          @keyframes zoomIn {
            0% { transform: scale(0.7); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

// Emojis para botones
const getEmoji = (index: number): string => {
  const emojis = ["🅰️", "🅱️", "🅲️"];
  return emojis[index] || "❓";
};

export default KidsShootQuestion;

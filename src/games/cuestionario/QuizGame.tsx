import React, { useState, useEffect } from 'react';

// Tipos TypeScript
interface Question {
  Pregunta: string;
  Respuesta1: string;
  Respuesta2: string;
  Respuesta3: string;
  Correcta: string;
}

interface QuizState {
  questions: Question[];
  currentQuestion: number;
  score: number;
  selectedAnswer: string | null;
  showResult: boolean;
  gameFinished: boolean;
  loading: boolean;
  error: string | null;
}

const QuizGame: React.FC = () => {
  const [state, setState] = useState<QuizState>({
    questions: [],
    currentQuestion: 0,
    score: 0,
    selectedAnswer: null,
    showResult: false,
    gameFinished: false,
    loading: true,
    error: null,
  });

  // Datos mock (temporales) - estructura preparada para fetch real
  const mockQuestions: Question[] = [
    {
      Pregunta: "¿Cuál es tu color favorito?",
      Respuesta1: "Azul como el cielo",
      Respuesta2: "Verde como la hierba", 
      Respuesta3: "Rosa como las flores",
      Correcta: "Verde como la hierba",
    },
    {
      Pregunta: "¿Qué animal te gusta más?",
      Respuesta1: "Gato",
      Respuesta2: "Perro",
      Respuesta3: "Unicornio", 
      Correcta: "Unicornio",
    },
    {
      Pregunta: "¿Cuál es tu comida favorita?",
      Respuesta1: "Pizza",
      Respuesta2: "Hamburguesa",
      Respuesta3: "Sushi", 
      Correcta: "Pizza",
    },
    {
      Pregunta: "¿Qué prefieres hacer en tu tiempo libre?",
      Respuesta1: "Leer libros",
      Respuesta2: "Ver películas",
      Respuesta3: "Jugar videojuegos", 
      Correcta: "Jugar videojuegos",
    }
  ];

  // Función para cargar preguntas (preparada para fetch real)
  const loadQuestions = async (): Promise<Question[]> => {
    try {
      // TODO: Reemplazar con fetch real cuando esté listo
      // const response = await fetch('/api/questions');
      // if (!response.ok) throw new Error('Error al cargar preguntas');
      // return await response.json();
      
      // Simulación de delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockQuestions;
    } catch (error) {
      throw new Error('Error al cargar las preguntas del quiz' + error);
    }
  };

  // Efecto para cargar preguntas al montar el componente
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const questions = await loadQuestions();
        setState(prev => ({ 
          ...prev, 
          questions, 
          loading: false 
        }));
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Error desconocido'
        }));
      }
    };

    fetchQuestions();
  }, []);

  // Función para seleccionar respuesta
  const selectAnswer = (answer: string) => {
    if (state.showResult) return;
    setState(prev => ({ ...prev, selectedAnswer: answer }));
  };

  // Función para confirmar respuesta
  const confirmAnswer = () => {
    if (!state.selectedAnswer) return;

    const isCorrect = state.selectedAnswer === state.questions[state.currentQuestion].Correcta;
    const newScore = isCorrect ? state.score + 1 : state.score;

    setState(prev => ({ 
      ...prev, 
      score: newScore,
      showResult: true 
    }));
  };

  // Función para siguiente pregunta
  const nextQuestion = () => {
    if (state.currentQuestion + 1 >= state.questions.length) {
      setState(prev => ({ ...prev, gameFinished: true }));
    } else {
      setState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        selectedAnswer: null,
        showResult: false,
      }));
    }
  };

  // Función para reiniciar el juego
  const restartGame = () => {
    setState(prev => ({
      ...prev,
      currentQuestion: 0,
      score: 0,
      selectedAnswer: null,
      showResult: false,
      gameFinished: false,
    }));
  };

  // Componente de carga
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-yellow-300 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-8 border-rainbow">
          <div className="text-6xl mb-6 animate-bounce">🎮</div>
          <div className="animate-spin rounded-full h-16 w-16 border-8 border-pink-400 border-t-yellow-400 mx-auto mb-6"></div>
          <p className="text-purple-700 text-xl font-bold">¡Preparando tu aventura!</p>
        </div>
      </div>
    );
  }

  // Componente de error
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-300 via-orange-300 to-red-300 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md border-8 border-orange-400">
          <div className="text-8xl mb-6 animate-pulse">😢</div>
          <h2 className="text-3xl font-bold text-purple-700 mb-4">¡Oops!</h2>
          <p className="text-lg text-purple-600 mb-8">Algo salió mal, pero podemos arreglarlo</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white px-8 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
          >
            ¡Intentar de nuevo! 🚀
          </button>
        </div>
      </div>
    );
  }

  const currentQ = state.questions[state.currentQuestion];
  const progress = ((state.currentQuestion + 1) / state.questions.length) * 100;

  // Pantalla de resultados finales
  if (state.gameFinished) {
    const percentage = Math.round((state.score / state.questions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg w-full border-8 border-yellow-400">
          <div className="text-9xl mb-6 animate-bounce">
            {percentage >= 80 ? '🏆' : percentage >= 60 ? '🌟' : '🎈'}
          </div>
          <h2 className="text-4xl font-bold text-purple-700 mb-6">¡Genial!</h2>
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 mb-8 border-4 border-pink-300">
            <p className="text-4xl font-bold text-pink-600 mb-2">
              {state.score} / {state.questions.length}
            </p>
            <p className="text-purple-600 text-lg font-semibold">¡Respuestas correctas!</p>
            <div className="mt-4">
              <div className="text-3xl font-bold text-purple-700">{percentage}%</div>
              <div className="flex justify-center mt-2">
                {Array.from({length: 5}).map((_, i) => (
                  <span key={i} className="text-2xl">
                    {i < (percentage / 20) ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-lg text-purple-600 mb-8 font-semibold">
            {percentage >= 80 
              ? '¡Eres súper inteligente! 🎉' 
              : percentage >= 60 
              ? '¡Lo hiciste muy bien! 👏' 
              : '¡Sigue practicando, vas genial! 💪'}
          </p>
          <button
            onClick={restartGame}
            className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white px-10 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
          >
            ¡Jugar otra vez! 🎮
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-green-200 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header con progreso */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-8 border-rainbow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-purple-700 flex items-center">
              🎯 ¡A Jugar!
            </h1>
            <div className="text-lg text-purple-600 font-semibold bg-yellow-100 px-4 py-2 rounded-full border-3 border-yellow-300">
              {state.currentQuestion + 1} de {state.questions.length}
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-6 mb-6 border-4 border-gray-300 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-pink-400 to-purple-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${progress}%` }}
            >
              {progress > 15 && <span className="text-white text-xs font-bold">🌟</span>}
            </div>
          </div>

          {/* Puntuación */}
          <div className="text-right">
            <span className="text-2xl font-bold text-green-600 bg-green-100 px-4 py-2 rounded-full border-3 border-green-300">
              ⭐ {state.score} puntos
            </span>
          </div>
        </div>

        {/* Pregunta */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-8 border-yellow-300">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤔</div>
            <h2 className="text-2xl font-bold text-purple-700 leading-relaxed">
              {currentQ.Pregunta}
            </h2>
          </div>

          {/* Opciones de respuesta */}
          <div className="space-y-4">
            {[currentQ.Respuesta1, currentQ.Respuesta2, currentQ.Respuesta3].map((option, index) => {
              const isSelected = state.selectedAnswer === option;
              const isCorrect = option === currentQ.Correcta;
              const showCorrect = state.showResult && isCorrect;
              const showIncorrect = state.showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(option)}
                  disabled={state.showResult}
                  className={`w-full p-6 text-left rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 ${
                    showCorrect
                      ? 'border-green-400 bg-green-100 text-green-800 shadow-lg'
                      : showIncorrect
                      ? 'border-red-400 bg-red-100 text-red-800 shadow-lg'
                      : isSelected
                      ? 'border-purple-400 bg-purple-100 text-purple-800 shadow-lg scale-105'
                      : 'border-blue-300 bg-blue-50 hover:border-purple-400 hover:bg-purple-50 text-blue-800'
                  } ${state.showResult ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}
                >
                  <div className="flex items-center">
                    <span className="font-bold mr-4 text-2xl bg-white rounded-full w-10 h-10 flex items-center justify-center border-2 border-current">
                      {['A', 'B', 'C'][index]}
                    </span>
                    <span className="flex-1 text-lg font-semibold">{option}</span>
                    {showCorrect && <span className="text-green-600 ml-4 text-3xl">🎉</span>}
                    {showIncorrect && <span className="text-red-600 ml-4 text-3xl">😔</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-8 border-pink-300">
          {!state.showResult ? (
            <button
              onClick={confirmAnswer}
              disabled={!state.selectedAnswer}
              className={`w-full py-4 px-8 rounded-full font-bold text-xl transition-all transform ${
                state.selectedAnswer
                  ? 'bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white hover:scale-105 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {state.selectedAnswer ? '¡Confirmar mi respuesta! ✨' : 'Elige una respuesta 👆'}
            </button>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                {state.selectedAnswer === currentQ.Correcta ? (
                  <div className="text-green-600 font-bold text-2xl bg-green-100 p-4 rounded-2xl border-4 border-green-300">
                    <div className="text-5xl mb-2">🎉</div>
                    ¡Excelente! ¡Lo lograste!
                  </div>
                ) : (
                  <div className="text-red-600 font-bold text-xl bg-red-100 p-4 rounded-2xl border-4 border-red-300">
                    <div className="text-5xl mb-2">💪</div>
                    ¡Casi! Sigue intentando<br />
                    <span className="text-lg">La respuesta era: <span className="text-green-600">{currentQ.Correcta}</span></span>
                  </div>
                )}
              </div>
              <button
                onClick={nextQuestion}
                className="bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white py-4 px-10 rounded-full font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
              >
                {state.currentQuestion + 1 >= state.questions.length ? '¡Ver mis resultados! 🏆' : '¡Siguiente pregunta! 🚀'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizGame;
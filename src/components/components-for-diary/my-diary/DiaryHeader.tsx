import { DiaryHeaderProps } from '@/src/typings/types-diary/types';

// components/DiaryHeader.tsx
export const DiaryHeader: React.FC<DiaryHeaderProps> = ({ totalEntradas, onNuevaEntrada, onVolver }) => (
  <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-xl">
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onVolver}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3">
              📖 Mis Diarios
              <span className="text-2xl bg-white/20 px-3 py-1 rounded-full">
                {totalEntradas}
              </span>
            </h1>
            <p className="text-white/90 mt-1">Todas tus aventuras en un solo lugar</p>
          </div>
        </div>

        <button
          onClick={onNuevaEntrada}
          className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="text-2xl">✨</span>
          Nueva Entrada
        </button>
      </div>
    </div>
  </div>
);

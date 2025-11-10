import { TituloStepProps } from '@/src/typings/types-diary/types';

export const TituloStep: React.FC<TituloStepProps> = ({ titulo, onTituloChange }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <div className="text-6xl mb-4">✍️</div>
      <h2 className="text-3xl font-black text-gray-800 mb-2">Dale un título a tu entrada</h2>
      <p className="text-gray-600 text-lg">Es opcional, puedes dejarlo en blanco</p>
    </div>
    
    <input
      type="text"
      value={titulo}
      onChange={(e) => onTituloChange(e.target.value)}
      placeholder="Ej: Un día increíble en la escuela"
      maxLength={150}
      className="w-full px-6 py-4 border-2 border-purple-300 rounded-xl text-lg focus:border-purple-500 focus:outline-none transition-colors font-semibold"
    />
    
    <p className="text-sm text-gray-500 text-right font-semibold">
      {titulo.length}/150 caracteres
    </p>
  </div>
);
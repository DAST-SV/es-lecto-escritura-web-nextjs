import {DeleteModalProps } from '@/src/typings/types-diary/types'


export const DeleteModal: React.FC<DeleteModalProps> = ({ 
  isOpen, 
  onConfirm, 
  onCancel 
}) =>  {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-8 border-red-300">
        <div className="text-center">
          <div className="text-8xl mb-4">⚠️</div>
          <h2 className="text-3xl font-black text-red-600 mb-4">
            ¿Estás seguro?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Esta entrada se eliminará para siempre y no podrás recuperarla 😢
          </p>
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-4 rounded-2xl font-black text-lg"
            >
              ❌ Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-black text-lg"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
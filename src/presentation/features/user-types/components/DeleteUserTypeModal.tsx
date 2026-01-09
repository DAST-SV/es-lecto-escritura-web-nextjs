/**
 * ============================================
 * ARCHIVO 6: src/presentation/features/user-types/components/DeleteUserTypeModal.tsx
 * ============================================
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { UserType } from '@/src/core/domain/entities/UserType';

interface DeleteUserTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
  userType: UserType | null;
}

export function DeleteUserTypeModal({ isOpen, onClose, onDelete, userType }: DeleteUserTypeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !userType) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await onDelete(userType.id);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Eliminar Tipo de Usuario</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-slate-700 mb-4">¿Está seguro que desea eliminar este tipo de usuario?</p>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2">
            <div>
              <span className="text-xs font-semibold text-slate-500">ID:</span>
              <p className="text-sm font-bold text-teal-600">#{userType.id}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">Nombre:</span>
              <p className="text-sm font-bold text-slate-800">{userType.nombre}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">Descripción:</span>
              <p className="text-sm text-slate-600">{userType.descripcion || 'Sin descripción'}</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">⚠️ Esta acción no se puede deshacer</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
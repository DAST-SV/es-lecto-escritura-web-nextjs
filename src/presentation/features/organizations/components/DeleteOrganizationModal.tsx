// ============================================
// src/presentation/features/organizations/components/DeleteOrganizationModal.tsx
// ============================================

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Organization } from '@/src/core/domain/entities/Organization';

interface DeleteOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string, hardDelete: boolean) => Promise<void>;
  organization: Organization | null;
  userId: string;
}

export function DeleteOrganizationModal({ 
  isOpen, 
  onClose, 
  onDelete, 
  organization,
  userId 
}: DeleteOrganizationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hardDelete, setHardDelete] = useState(false);

  if (!isOpen || !organization) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await onDelete(organization.id, hardDelete);
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
          <h2 className="text-xl font-bold text-slate-800">Eliminar Organización</h2>
          <button onClick={onClose} className="ml-auto p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-slate-700 mb-4">
            ¿Está seguro que desea eliminar esta organización?
          </p>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500">Nombre:</span>
              <p className="text-sm font-bold text-slate-800">{organization.name}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">Slug:</span>
              <p className="text-sm text-slate-600">@{organization.slug}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
            <input
              type="checkbox"
              id="hardDelete"
              checked={hardDelete}
              onChange={(e) => setHardDelete(e.target.checked)}
              className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="hardDelete" className="text-sm text-amber-900">
              <span className="font-semibold">Eliminación permanente</span>
              <p className="text-xs text-amber-700 mt-1">
                Si no marca esta casilla, la organización se moverá a la papelera.
              </p>
            </label>
          </div>

          {hardDelete && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Esta acción no se puede deshacer
              </p>
            </div>
          )}
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
// ============================================
// src/presentation/components/shared/Modals/DeleteConfirmModal.tsx
// 📄 ARCHIVO 2/8 - Modal de confirmación de eliminación
// ============================================

'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hardDelete: boolean) => Promise<void>;
  title: string;
  itemName: string;
  itemDetails?: { label: string; value: string }[];
  showHardDeleteOption?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemDetails,
  showHardDeleteOption = false,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [hardDelete, setHardDelete] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(hardDelete);
      onClose();
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isDeleting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            ¿Estás seguro de que deseas eliminar <strong>{itemName}</strong>?
          </p>

          {/* Item Details */}
          {itemDetails && itemDetails.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
              {itemDetails.map((detail, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{detail.label}:</span>
                  <span className="font-medium text-gray-900">{detail.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Hard Delete Option */}
          {showHardDeleteOption && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hardDelete}
                  onChange={(e) => setHardDelete(e.target.checked)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">
                    Eliminación permanente
                  </p>
                  <p className="text-xs text-yellow-800 mt-1">
                    Si marcas esta opción, el registro se eliminará de forma permanente 
                    y NO podrá ser recuperado. De lo contrario, se marcará como eliminado 
                    pero permanecerá en la base de datos.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer fácilmente.
              {hardDelete && ' Los datos se eliminarán PERMANENTEMENTE.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className={`flex-1 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              hardDelete
                ? 'bg-red-700 hover:bg-red-800'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isDeleting
              ? 'Eliminando...'
              : hardDelete
              ? '🔥 Eliminar Permanentemente'
              : 'Eliminar'}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
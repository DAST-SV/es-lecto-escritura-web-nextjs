// ============================================
// src/presentation/components/shared/Modals.tsx
// ✅ MODALES REUTILIZABLES CON DISEÑO CONSISTENTE
// ============================================

'use client';

import React, { ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';

// ============================================
// MODAL BASE
// ============================================

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function BaseModal({ isOpen, onClose, title, children, maxWidth = 'md' }: BaseModalProps) {
  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
      <div 
        className={`bg-white rounded-2xl p-6 w-full ${widthClasses[maxWidth]} shadow-2xl max-h-[calc(100vh-80px)] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============================================
// MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
// ============================================

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
  itemDetails = [],
  showHardDeleteOption = true,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [hardDelete, setHardDelete] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      await onConfirm(hardDelete);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setHardDelete(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button 
            onClick={handleClose} 
            className="ml-auto p-1 hover:bg-slate-100 rounded"
          >
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
            ¿Está seguro que desea eliminar este elemento?
          </p>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-500">Nombre:</span>
              <p className="text-sm font-bold text-slate-800">{itemName}</p>
            </div>
            {itemDetails.map((detail, idx) => (
              <div key={idx}>
                <span className="text-xs font-semibold text-slate-500">{detail.label}:</span>
                <p className="text-sm text-slate-600">{detail.value}</p>
              </div>
            ))}
          </div>

          {showHardDeleteOption && (
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
                  Si no marca esta casilla, el elemento se moverá a la papelera y podrá recuperarlo después.
                </p>
              </label>
            </div>
          )}

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
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 transition disabled:opacity-50 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
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

// ============================================
// MODAL DE EDICIÓN GENÉRICO
// ============================================

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'number';
  value: any;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  rows?: number;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  title: string;
  fields: FormField[];
  submitButtonText?: string;
  submitButtonColor?: 'teal' | 'amber' | 'blue' | 'green';
}

export function EditModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  submitButtonText = 'Guardar',
  submitButtonColor = 'amber',
}: EditModalProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        initialData[field.name] = field.value;
      });
      setFormData(initialData);
      setError('');
    }
  }, [isOpen, fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses = {
    teal: 'from-teal-500 to-cyan-500',
    amber: 'from-amber-400 to-yellow-500',
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-emerald-500 to-green-500',
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                value={formData[field.name] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                required={field.required}
                disabled={field.disabled}
                placeholder={field.placeholder}
                rows={field.rows || 3}
                minLength={field.minLength}
                maxLength={field.maxLength}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            ) : field.type === 'select' ? (
              <select
                value={formData[field.name] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                required={field.required}
                disabled={field.disabled}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!formData[field.name]}
                  onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.checked }))}
                  disabled={field.disabled}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-slate-600">{field.placeholder}</span>
              </div>
            ) : (
              <input
                type={field.type}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  [field.name]: field.type === 'number' ? Number(e.target.value) : e.target.value 
                }))}
                required={field.required}
                disabled={field.disabled}
                placeholder={field.placeholder}
                minLength={field.minLength}
                maxLength={field.maxLength}
                min={field.min}
                max={field.max}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 transition disabled:opacity-50 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 bg-gradient-to-r ${colorClasses[submitButtonColor]} text-white py-2 px-4 rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50`}
          >
            {loading ? 'Guardando...' : submitButtonText}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
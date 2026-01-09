// ============================================
// src/presentation/features/organizations/components/CreateOrganizationModal.tsx
// ✅ CORREGIDO: Regex pattern y validación
// ============================================

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { 
  OrganizationType, 
  organizationTypeLabels 
} from '@/src/core/domain/entities/Organization';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
  userId: string;
}

export function CreateOrganizationModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  userId 
}: CreateOrganizationModalProps) {
  const [formData, setFormData] = useState({
    organizationType: 'educational_institution' as OrganizationType,
    name: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setFormData({
      organizationType: 'educational_institution',
      name: '',
      slug: '',
      description: '',
      email: '',
      phone: '',
      website: '',
    });
    setError('');
    onClose();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno
      .replace(/^-|-$/g, '') // Quitar guiones al inicio/final
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const validateSlug = (slug: string): boolean => {
    // Validar: solo letras minúsculas, números y guiones
    return /^[a-z0-9]+([a-z0-9-]*[a-z0-9]+)?$/.test(slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones adicionales
    if (!validateSlug(formData.slug)) {
      setError('El slug solo puede contener letras minúsculas, números y guiones (sin espacios)');
      setLoading(false);
      return;
    }

    if (formData.slug.length < 3) {
      setError('El slug debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    try {
      await onCreate({
        ...formData,
        description: formData.description || null,
        email: formData.email || null,
        phone: formData.phone || null,
        website: formData.website || null,
      });
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Nueva Organización</h2>
          <button onClick={handleClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Organization Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tipo de Organización <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.organizationType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                organizationType: e.target.value as OrganizationType 
              }))}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {(Object.entries(organizationTypeLabels) as [OrganizationType, string][]).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              minLength={3}
              maxLength={200}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Slug - SIN PATTERN ATTRIBUTE */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Slug (URL) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
              required
              minLength={3}
              maxLength={100}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Solo letras minúsculas, números y guiones (sin espacios). Ejemplo: mi-organizacion-2024
            </p>
            {formData.slug && !validateSlug(formData.slug) && (
              <p className="text-xs text-red-500 mt-1">⚠️ Slug inválido</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sitio Web</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Organización'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
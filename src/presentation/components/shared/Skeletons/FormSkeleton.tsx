// ============================================
// src/presentation/components/shared/Skeletons/FormSkeleton.tsx
// Skeleton para formularios
// ============================================

'use client';

import React, { memo } from 'react';

interface FormFieldSkeletonProps {
  /** Tipo de campo */
  type?: 'input' | 'textarea' | 'select';
  /** Mostrar label */
  showLabel?: boolean;
}

const FormFieldSkeleton = memo<FormFieldSkeletonProps>(({
  type = 'input',
  showLabel = true,
}) => {
  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="h-4 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse" />
      )}
      <div
        className={`w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse ${
          type === 'textarea' ? 'h-24' : 'h-10'
        }`}
      />
    </div>
  );
});

FormFieldSkeleton.displayName = 'FormFieldSkeleton';

interface FormSkeletonProps {
  /** Numero de campos */
  fields?: number;
  /** Incluir textarea */
  includeTextarea?: boolean;
  /** Incluir select */
  includeSelect?: boolean;
  /** Mostrar botones de accion */
  showActions?: boolean;
  /** Columnas del formulario */
  columns?: 1 | 2;
}

/**
 * Skeleton para formularios de admin
 */
export const FormSkeleton = memo<FormSkeletonProps>(({
  fields = 4,
  includeTextarea = true,
  includeSelect = true,
  showActions = true,
  columns = 1,
}) => {
  const gridClass = columns === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4';

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
      <div className={gridClass}>
        {Array.from({ length: fields }).map((_, i) => (
          <FormFieldSkeleton key={i} type="input" />
        ))}
        {includeSelect && <FormFieldSkeleton type="select" />}
        {includeTextarea && (
          <div className={columns === 2 ? 'md:col-span-2' : ''}>
            <FormFieldSkeleton type="textarea" />
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <div className="h-10 w-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 rounded-lg animate-pulse" />
        </div>
      )}
    </div>
  );
});

FormSkeleton.displayName = 'FormSkeleton';

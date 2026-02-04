// ============================================
// src/presentation/components/shared/Skeletons/AdminTableSkeleton.tsx
// Skeleton reutilizable para tablas de admin con estilos de HomePage
// ============================================

'use client';

import React, { memo } from 'react';

interface AdminTableSkeletonProps {
  /** Numero de filas a mostrar */
  rows?: number;
  /** Numero de columnas a mostrar */
  columns?: number;
  /** Mostrar header de busqueda */
  showHeader?: boolean;
  /** Color primario del gradiente (tailwind class) */
  gradientFrom?: string;
  /** Color secundario del gradiente (tailwind class) */
  gradientVia?: string;
  /** Color final del gradiente (tailwind class) */
  gradientTo?: string;
}

/**
 * Skeleton para tablas de administracion
 * Usa los estilos vibrantes de la HomePage
 */
export const AdminTableSkeleton = memo<AdminTableSkeletonProps>(({
  rows = 5,
  columns = 6,
  showHeader = true,
  gradientFrom = 'from-slate-200',
  gradientVia = 'via-slate-100',
  gradientTo = 'to-slate-200',
}) => {
  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Card Container */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        {/* Header Skeleton */}
        {showHeader && (
          <div className="p-4 sm:p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Title */}
              <div className="h-8 w-48 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse" />

              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="flex-1 sm:flex-none sm:w-64 h-10 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse" />
                {/* Button */}
                <div className="h-10 w-32 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Table Skeleton */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Table Header */}
            <thead className="bg-slate-50/80">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <div
                      className={`h-4 bg-gradient-to-r ${gradientFrom} ${gradientVia} ${gradientTo} rounded animate-pulse`}
                      style={{ width: i === 0 ? '60px' : i === columns - 1 ? '80px' : `${60 + Math.random() * 60}px` }}
                    />
                  </th>
                ))}
                {/* Actions column */}
                <th className="px-4 py-3 text-right">
                  <div className="h-4 w-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse ml-auto" />
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50/50 transition-colors">
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="px-4 py-4">
                      {colIndex === 0 ? (
                        // First column - often an image/icon
                        <div className="flex items-center justify-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse" />
                        </div>
                      ) : colIndex === 1 ? (
                        // Second column - often main content
                        <div className="space-y-1.5">
                          <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse w-32" />
                          <div className="h-3 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 rounded animate-pulse w-24" />
                        </div>
                      ) : colIndex === columns - 1 ? (
                        // Last column - status badge
                        <div className="flex justify-center">
                          <div className="h-6 w-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-full animate-pulse" />
                        </div>
                      ) : (
                        // Other columns
                        <div
                          className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse"
                          style={{ width: `${40 + Math.random() * 40}px` }}
                        />
                      )}
                    </td>
                  ))}
                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse" />
                      <div className="w-8 h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="h-4 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
});

AdminTableSkeleton.displayName = 'AdminTableSkeleton';

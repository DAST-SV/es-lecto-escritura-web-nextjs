/**
 * UBICACIÓN: app/[locale]/admin/audit/page.tsx
 * 🔍 Página de auditoría de libros
 */

'use client';

import { useState } from 'react';
import {
  FileSearch,
  AlertCircle,
  CheckCircle,
  Trash2,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Image,
  Link2,
  XCircle,
} from 'lucide-react';

interface AuditSummary {
  totalBooks: number;
  activeBooks: number;
  deletedBooks: number;
  orphanedFiles: number;
  brokenRelations: number;
  duplicates: number;
  issues: number;
}

interface AuditDetails {
  orphanedPDFs: string[];
  orphanedImages: string[];
  booksWithoutPDF: Array<{ id: string; title: string }>;
  booksWithoutCover: Array<{ id: string; title: string }>;
  brokenAuthorRelations: any[];
  brokenCharacterRelations: any[];
  brokenCategoryRelations: any[];
  brokenGenreRelations: any[];
  brokenTagRelations: any[];
  brokenValueRelations: any[];
  duplicateAuthors: Array<{ name: string; count: number; ids: string[] }>;
  duplicateCharacters: Array<{ name: string; count: number; ids: string[] }>;
  oldSoftDeletes: Array<{ id: string; title: string; deleted_at: string; days_ago: number }>;
  booksWithoutRelations: Array<{ id: string; title: string; missing: string[] }>;
}

interface AuditReport {
  timestamp: string;
  summary: AuditSummary;
  details: AuditDetails;
  recommendations: string[];
}

export default function AuditPage() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/audit-books-clean');
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error ejecutando auditoría:', error);
      alert('Error al ejecutar la auditoría');
    } finally {
      setIsLoading(false);
    }
  };

  const runCleanup = async () => {
    if (!confirm('¿Estás seguro? Esta acción eliminará archivos huérfanos y relaciones rotas.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/audit-books-clean?action=cleanup', {
        method: 'POST',
      });
      const data = await response.json();
      alert('Limpieza completada');
      runAudit();
    } catch (error) {
      console.error('Error ejecutando limpieza:', error);
      alert('Error al ejecutar la limpieza');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getHealthStatus = (issues: number) => {
    if (issues === 0) {
      return {
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        label: 'Saludable',
        icon: CheckCircle,
      };
    } else if (issues < 10) {
      return {
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        label: 'Atención',
        icon: AlertCircle,
      };
    } else {
      return {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        label: 'Crítico',
        icon: XCircle,
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSearch size={28} />
            Auditoría de Integridad
          </h2>
          <p className="text-gray-600 mt-1">
            Verifica la integridad de datos, detecta archivos huérfanos y relaciones rotas
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={runAudit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Ejecutando...' : 'Ejecutar Auditoría'}
          </button>

          {report && (
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download size={18} />
              Descargar Reporte
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !report && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Analizando base de datos...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!report && !isLoading && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileSearch size={48} className="mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No hay auditoría ejecutada
          </h3>
          <p className="mt-2 text-gray-600">
            Haz clic en "Ejecutar Auditoría" para comenzar el análisis
          </p>
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="space-y-6">
          {/* Health Status */}
          {(() => {
            const health = getHealthStatus(report.summary.issues);
            const HealthIcon = health.icon;
            return (
              <div className={`${health.bg} ${health.border} border rounded-lg p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HealthIcon className={health.color} size={32} />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Estado: {health.label}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {report.summary.issues} issue{report.summary.issues !== 1 ? 's' : ''}{' '}
                        encontrado{report.summary.issues !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Última ejecución</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(report.timestamp).toLocaleString('es-SV', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Libros Totales</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {report.summary.totalBooks}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {report.summary.activeBooks} activos
                  </p>
                </div>
                <BookOpen className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Archivos Huérfanos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {report.summary.orphanedFiles}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {report.details.orphanedPDFs.length} PDFs +{' '}
                    {report.details.orphanedImages.length} imágenes
                  </p>
                </div>
                <Image className="text-amber-600" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Relaciones Rotas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {report.summary.brokenRelations}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">En 6 tablas</p>
                </div>
                <Link2 className="text-red-600" size={32} />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💡 Recomendaciones
              </h3>
              <ul className="space-y-2">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <span className="text-blue-600 font-semibold">{i + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
              {report.summary.issues > 0 && (
                <button
                  onClick={runCleanup}
                  disabled={isLoading}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <Trash2 size={18} />
                  Ejecutar Limpieza Automática
                </button>
              )}
            </div>
          )}

          {/* Detailed Sections */}
          <div className="space-y-4">
            {/* Orphaned PDFs */}
            {report.details.orphanedPDFs.length > 0 && (
              <DetailSection
                title="PDFs Huérfanos"
                count={report.details.orphanedPDFs.length}
                icon="📄"
                isExpanded={expandedSections.has('pdfs')}
                onToggle={() => toggleSection('pdfs')}
              >
                <ul className="space-y-1">
                  {report.details.orphanedPDFs.map((pdf, i) => (
                    <li key={i} className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded">
                      {pdf}
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {/* Orphaned Images */}
            {report.details.orphanedImages.length > 0 && (
              <DetailSection
                title="Imágenes Huérfanas"
                count={report.details.orphanedImages.length}
                icon="🖼️"
                isExpanded={expandedSections.has('images')}
                onToggle={() => toggleSection('images')}
              >
                <ul className="space-y-1">
                  {report.details.orphanedImages.map((img, i) => (
                    <li key={i} className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded">
                      {img}
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {/* Books Without PDF */}
            {report.details.booksWithoutPDF.length > 0 && (
              <DetailSection
                title="Libros Sin PDF"
                count={report.details.booksWithoutPDF.length}
                icon="📕"
                isExpanded={expandedSections.has('nopdf')}
                onToggle={() => toggleSection('nopdf')}
              >
                <ul className="space-y-2">
                  {report.details.booksWithoutPDF.map((book, i) => (
                    <li key={i} className="text-sm bg-gray-50 p-3 rounded">
                      <p className="font-semibold text-gray-900">{book.title}</p>
                      <p className="text-xs text-gray-500 font-mono">{book.id}</p>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            {/* Duplicate Authors */}
            {report.details.duplicateAuthors.length > 0 && (
              <DetailSection
                title="Autores Duplicados"
                count={report.details.duplicateAuthors.length}
                icon="👤"
                isExpanded={expandedSections.has('dupauthors')}
                onToggle={() => toggleSection('dupauthors')}
              >
                <ul className="space-y-2">
                  {report.details.duplicateAuthors.map((dup, i) => (
                    <li key={i} className="text-sm bg-gray-50 p-3 rounded">
                      <p className="font-semibold text-gray-900">
                        {dup.name} ({dup.count} veces)
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        IDs: {dup.ids.join(', ')}
                      </p>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  count: number;
  icon: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function DetailSection({
  title,
  count,
  icon,
  isExpanded,
  onToggle,
  children,
}: DetailSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{count} encontrados</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isExpanded && <div className="p-4 border-t border-gray-200">{children}</div>}
    </div>
  );
}
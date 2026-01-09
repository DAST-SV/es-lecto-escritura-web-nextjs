/**
 * UBICACIÓN: app/[locale]/admin/audit/page.tsx
 * ✅ TODO EN CLIENTE: Sin APIs, directo con Supabase
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
  Loader2,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import toast from 'react-hot-toast';

interface AuditReport {
  timestamp: string;
  summary: {
    totalBooks: number;
    activeBooks: number;
    deletedBooks: number;
    orphanedFiles: number;
    brokenRelations: number;
    duplicates: number;
    issues: number;
  };
  details: {
    orphanedPDFs: string[];
    orphanedImages: string[];
    booksWithoutPDF: Array<{ id: string; title: string }>;
    booksWithoutCover: Array<{ id: string; title: string }>;
    brokenAuthorRelations: any[];
    brokenCharacterRelations: any[];
    oldSoftDeletes: Array<{ id: string; title: string; deleted_at: string; days_ago: number }>;
  };
  recommendations: string[];
}

export default function AuditPage() {
  const supabase = createClient();
  
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [isLoadingCleanup, setIsLoadingCleanup] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  // ============================================
  // EJECUTAR AUDITORÍA (Cliente)
  // ============================================
  const runAudit = async () => {
    setIsLoadingAudit(true);
    setError(null);
    
    try {
      console.log('🚀 Ejecutando auditoría desde cliente...');

      const newReport: AuditReport = {
        timestamp: new Date().toISOString(),
        summary: {
          totalBooks: 0,
          activeBooks: 0,
          deletedBooks: 0,
          orphanedFiles: 0,
          brokenRelations: 0,
          duplicates: 0,
          issues: 0,
        },
        details: {
          orphanedPDFs: [],
          orphanedImages: [],
          booksWithoutPDF: [],
          booksWithoutCover: [],
          brokenAuthorRelations: [],
          brokenCharacterRelations: [],
          oldSoftDeletes: [],
        },
        recommendations: [],
      };

      // 1. AUDITAR LIBROS
      const { data: books } = await supabase
        .from('books')
        .select('id, title, cover_url, pdf_url, deleted_at, created_at');

      if (books) {
        newReport.summary.totalBooks = books.length;
        newReport.summary.activeBooks = books.filter(b => !b.deleted_at).length;
        newReport.summary.deletedBooks = books.filter(b => b.deleted_at).length;

        // Libros sin PDF
        const booksWithoutPDF = books
          .filter(b => !b.deleted_at && !b.pdf_url)
          .map(b => ({ id: b.id, title: b.title || 'Sin título' }));
        newReport.details.booksWithoutPDF = booksWithoutPDF;

        // Libros sin portada
        const booksWithoutCover = books
          .filter(b => !b.deleted_at && !b.cover_url)
          .map(b => ({ id: b.id, title: b.title || 'Sin título' }));
        newReport.details.booksWithoutCover = booksWithoutCover;

        // Soft deletes antiguos (>30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const oldSoftDeletes = books
          .filter(b => {
            if (!b.deleted_at) return false;
            return new Date(b.deleted_at) < thirtyDaysAgo;
          })
          .map(b => {
            const daysAgo = Math.floor(
              (Date.now() - new Date(b.deleted_at!).getTime()) / (1000 * 60 * 60 * 24)
            );
            return {
              id: b.id,
              title: b.title || 'Sin título',
              deleted_at: b.deleted_at!,
              days_ago: daysAgo,
            };
          });
        newReport.details.oldSoftDeletes = oldSoftDeletes;

        // 2. AUDITAR RELACIONES ROTAS
        const activeBookIds = new Set(
          books.filter(b => !b.deleted_at).map(b => b.id)
        );

        // Autores
        const { data: authorRels } = await supabase
          .from('books_authors')
          .select('book_id, author_id');

        const { data: validAuthors } = await supabase
          .from('book_authors')
          .select('id');

        const validAuthorIds = new Set(validAuthors?.map(a => a.id) || []);

        if (authorRels) {
          for (const rel of authorRels) {
            if (!activeBookIds.has(rel.book_id) || !validAuthorIds.has(rel.author_id)) {
              newReport.details.brokenAuthorRelations.push(rel);
            }
          }
        }

        // Personajes
        const { data: charRels } = await supabase
          .from('books_characters')
          .select('book_id, character_id');

        const { data: validChars } = await supabase
          .from('book_characters')
          .select('id');

        const validCharIds = new Set(validChars?.map(c => c.id) || []);

        if (charRels) {
          for (const rel of charRels) {
            if (!activeBookIds.has(rel.book_id) || !validCharIds.has(rel.character_id)) {
              newReport.details.brokenCharacterRelations.push(rel);
            }
          }
        }

        newReport.summary.brokenRelations = 
          newReport.details.brokenAuthorRelations.length +
          newReport.details.brokenCharacterRelations.length;

        // 3. CALCULAR ISSUES
        newReport.summary.issues =
          newReport.details.booksWithoutPDF.length +
          newReport.details.booksWithoutCover.length +
          newReport.summary.orphanedFiles +
          newReport.summary.brokenRelations +
          newReport.details.oldSoftDeletes.length;

        // 4. GENERAR RECOMENDACIONES
        newReport.recommendations = generateRecommendations(newReport);

        console.log('✅ Auditoría completada:', newReport);
        setReport(newReport);
      }

    } catch (error: any) {
      console.error('❌ Error:', error);
      setError(error.message);
      toast.error('Error ejecutando auditoría');
    } finally {
      setIsLoadingAudit(false);
    }
  };

  // ============================================
  // EJECUTAR LIMPIEZA (Cliente)
  // ============================================
  const executeCleanup = async () => {
    setShowConfirmModal(false);
    setIsLoadingCleanup(true);
    setError(null);
    
    try {
      console.log('🧹 Ejecutando limpieza desde cliente...');

      const results = {
        relations: 0,
        oldBooks: 0,
        orphanedPDFs: 0,
        orphanedImages: 0,
      };

      // 1. Obtener libros activos
      const { data: books } = await supabase
        .from('books')
        .select('id')
        .is('deleted_at', null);

      const activeBookIds = new Set((books || []).map(b => b.id));

      // 2. Limpiar relaciones rotas
      const tables = [
        'books_authors',
        'books_characters',
        'books_categories',
        'books_genres',
        'books_tags',
        'books_values'
      ];

      for (const table of tables) {
        const { data: rels } = await supabase
          .from(table)
          .select('book_id');

        if (rels) {
          const toDelete = [...new Set(
            rels
              .filter(r => !activeBookIds.has(r.book_id))
              .map(r => r.book_id)
          )];

          if (toDelete.length > 0) {
            const { error } = await supabase
              .from(table)
              .delete()
              .in('book_id', toDelete);

            if (!error) {
              results.relations += toDelete.length;
            }
          }
        }
      }

      // 3. Eliminar soft deletes antiguos (>90 días)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: oldBooks } = await supabase
        .from('books')
        .select('id, title, deleted_at, user_id, pdf_url, cover_url')
        .not('deleted_at', 'is', null)
        .lt('deleted_at', ninetyDaysAgo.toISOString());

      if (oldBooks && oldBooks.length > 0) {
        // Eliminar archivos físicos primero
        for (const book of oldBooks) {
          // Eliminar PDFs
          if (book.pdf_url && book.user_id) {
            const { error: pdfError } = await supabase.storage
              .from('book-pdfs')
              .remove([`${book.user_id}/${book.id}`]);
            
            if (!pdfError) results.orphanedPDFs++;
          }

          // Eliminar imágenes
          if (book.cover_url && book.user_id) {
            const { error: imgError } = await supabase.storage
              .from('book-images')
              .remove([`${book.user_id}/${book.id}`]);
            
            if (!imgError) results.orphanedImages++;
          }
        }

        // Eliminar registros de BD
        const { error } = await supabase
          .from('books')
          .delete()
          .in('id', oldBooks.map(b => b.id));

        if (!error) {
          results.oldBooks = oldBooks.length;
        }
      }

      const totalCleaned = 
        results.relations + 
        results.oldBooks + 
        results.orphanedPDFs + 
        results.orphanedImages;

      console.log('✅ Limpieza completada:', results);

      setCleanupResult({
        success: true,
        cleaned: totalCleaned,
        details: results,
      });
      setShowResultModal(true);

      // Refrescar auditoría
      await runAudit();
      toast.success('Limpieza completada exitosamente');

    } catch (error: any) {
      console.error('❌ Error:', error);
      setError(error.message);
      toast.error('Error ejecutando limpieza');
    } finally {
      setIsLoadingCleanup(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getHealthStatus = (issues: number) => {
    if (issues === 0) {
      return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Saludable', icon: CheckCircle };
    } else if (issues < 10) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Atención', icon: AlertCircle };
    } else {
      return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Crítico', icon: XCircle };
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const isLoading = isLoadingAudit || isLoadingCleanup;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileSearch size={28} />
              Auditoría de Integridad
            </h2>
            <p className="text-gray-600 mt-1">Detecta archivos huérfanos y relaciones rotas</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={runAudit}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={18} className={isLoadingAudit ? 'animate-spin' : ''} />
              {isLoadingAudit ? 'Ejecutando...' : 'Ejecutar Auditoría'}
            </button>

            {report && (
              <button onClick={downloadReport} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Download size={18} />
                Descargar
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoadingAudit && !report && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Analizando base de datos...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!report && !isLoading && !error && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileSearch size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No hay auditoría ejecutada</h3>
            <p className="mt-2 text-gray-600">Haz clic en "Ejecutar Auditoría"</p>
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
                        <h3 className="text-xl font-semibold text-gray-900">Estado: {health.label}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.summary.issues} issue{report.summary.issues !== 1 ? 's' : ''} encontrado{report.summary.issues !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Última ejecución</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(report.timestamp).toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' })}
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
                    <p className="text-3xl font-bold text-gray-900 mt-1">{report.summary.totalBooks}</p>
                    <p className="text-sm text-green-600 mt-1">{report.summary.activeBooks} activos</p>
                  </div>
                  <BookOpen className="text-blue-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Archivos Huérfanos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{report.summary.orphanedFiles}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {report.details.orphanedPDFs.length} PDFs + {report.details.orphanedImages.length} imágenes
                    </p>
                  </div>
                  <Image className="text-amber-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Relaciones Rotas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{report.summary.brokenRelations}</p>
                    <p className="text-sm text-gray-500 mt-1">En tablas pivot</p>
                  </div>
                  <Link2 className="text-red-600" size={32} />
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Recomendaciones</h3>
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
                    onClick={() => setShowConfirmModal(true)}
                    disabled={isLoading}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoadingCleanup ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Limpiando...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Ejecutar Limpieza
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Details */}
            <div className="space-y-4">
              {report.details.booksWithoutPDF.length > 0 && (
                <DetailSection
                  title="Libros sin PDF"
                  count={report.details.booksWithoutPDF.length}
                  icon="📄"
                  isExpanded={expandedSections.has('nopdf')}
                  onToggle={() => toggleSection('nopdf')}
                >
                  <ul className="space-y-1">
                    {report.details.booksWithoutPDF.map((book, i) => (
                      <li key={i} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{book.title}</li>
                    ))}
                  </ul>
                </DetailSection>
              )}

              {report.details.booksWithoutCover.length > 0 && (
                <DetailSection
                  title="Libros sin Portada"
                  count={report.details.booksWithoutCover.length}
                  icon="🖼️"
                  isExpanded={expandedSections.has('nocover')}
                  onToggle={() => toggleSection('nocover')}
                >
                  <ul className="space-y-1">
                    {report.details.booksWithoutCover.map((book, i) => (
                      <li key={i} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{book.title}</li>
                    ))}
                  </ul>
                </DetailSection>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modales (igual que antes) */}
      {showConfirmModal && (
        <Modal onClose={() => setShowConfirmModal(false)}>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">¿Ejecutar Limpieza?</h3>
            
            <p className="text-gray-600 mb-6">
              Esta acción eliminará <strong>permanentemente</strong> los problemas detectados.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={executeCleanup}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold shadow-lg shadow-red-600/30"
              >
                Sí, Limpiar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showResultModal && cleanupResult && (
        <Modal onClose={() => {
          setShowResultModal(false);
          runAudit();
        }}>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Limpieza Completada</h3>
            
            <p className="text-gray-600 mb-6">
              Se limpiaron <strong className="text-green-600">{cleanupResult.cleaned}</strong> elementos
            </p>

            <button
              onClick={() => {
                setShowResultModal(false);
                runAudit();
              }}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold shadow-lg shadow-green-600/30"
            >
              Perfecto, Cerrar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function DetailSection({ title, count, icon, isExpanded, onToggle, children }: any) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
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

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 transform transition-all animate-in fade-in zoom-in duration-300">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}

function generateRecommendations(report: AuditReport): string[] {
  const recommendations: string[] = [];

  if (report.summary.brokenRelations > 0) {
    recommendations.push(
      `Limpiar ${report.summary.brokenRelations} relaciones rotas en la base de datos`
    );
  }

  if (report.details.oldSoftDeletes.length > 0) {
    recommendations.push(
      `Eliminar permanentemente ${report.details.oldSoftDeletes.length} libros en papelera hace más de 30 días`
    );
  }

  if (report.details.booksWithoutPDF.length > 0) {
    recommendations.push(
      `Revisar ${report.details.booksWithoutPDF.length} libros sin archivo PDF`
    );
  }

  if (report.details.booksWithoutCover.length > 0) {
    recommendations.push(
      `Agregar portadas a ${report.details.booksWithoutCover.length} libros`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ ¡Todo está en orden! No se detectaron problemas');
  }

  return recommendations;
}
// src/presentation/features/my-world/components/WriterBookCard.tsx
/**
 * ============================================
 * COMPONENTE: WriterBookCard
 * Card limpia de libro para escritor
 * Hover para acciones, sin botones feos
 * ============================================
 */

'use client';

import React, { memo } from 'react';
import {
  BookOpen,
  Eye,
  Edit,
  Send,
  EyeOff,
  BarChart2,
  Trash2,
  FileText,
  Clock,
  Globe,
  Archive,
  Loader2,
} from 'lucide-react';
import { AuthoredBook } from '@/src/infrastructure/repositories/my-world/MyWorldRepository';

type BookStatus = 'draft' | 'pending' | 'published' | 'archived';

interface WriterBookCardProps {
  book: AuthoredBook;
  onRead: (bookId: string) => void;
  onEdit: (bookId: string) => void;
  onPublish: (book: AuthoredBook) => void;
  onStats: (bookId: string) => void;
  onTrash: (book: AuthoredBook) => void;
  isPublishing?: boolean;
  labels: {
    read: string;
    edit: string;
    publish: string;
    unpublish: string;
    stats: string;
    moveToTrash: string;
    views: string;
    pages: string;
    statusDraft: string;
    statusPending: string;
    statusPublished: string;
    statusArchived: string;
  };
  priority?: boolean;
}

const STATUS_CONFIG: Record<BookStatus, { icon: React.ReactNode; bg: string; text: string; border: string }> = {
  draft: { icon: <FileText className="w-3 h-3" />, bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  pending: { icon: <Clock className="w-3 h-3" />, bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
  published: { icon: <Globe className="w-3 h-3" />, bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
  archived: { icon: <Archive className="w-3 h-3" />, bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' },
};

export const WriterBookCard: React.FC<WriterBookCardProps> = memo(
  ({ book, onRead, onEdit, onPublish, onStats, onTrash, isPublishing = false, labels, priority = false }) => {
    const statusConfig = STATUS_CONFIG[book.status];

    const statusLabel = {
      draft: labels.statusDraft,
      pending: labels.statusPending,
      published: labels.statusPublished,
      archived: labels.statusArchived,
    }[book.status];

    return (
      <article className="group relative flex-shrink-0 w-44 sm:w-48 md:w-52">
        <div className="relative bg-white rounded-2xl border-2 border-yellow-200 shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-2xl group-hover:border-yellow-400">
          {/* Status badge */}
          <div className={`absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} shadow-sm`}>
            {statusConfig.icon}
            {statusLabel}
          </div>

          {/* Views badge (solo publicados) */}
          {book.status === 'published' && book.viewCount > 0 && (
            <div className="absolute top-2 right-2 z-20 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold text-purple-600 shadow-sm border border-purple-200 flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              {book.viewCount}
            </div>
          )}

          {/* Portada */}
          <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading={priority ? 'eager' : 'lazy'}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200">
                <div className="text-center p-3">
                  <BookOpen className="w-10 h-10 text-blue-300 mx-auto mb-1" />
                  <p className="text-blue-400 font-bold text-xs line-clamp-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {book.title}
                  </p>
                </div>
              </div>
            )}

            {/* Overlay + acciones al hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute inset-0 flex flex-col justify-end p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
              {/* Acciones principales */}
              <div className="flex gap-1.5 mb-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onRead(book.id); }}
                  className="flex-1 py-2 bg-yellow-300 text-blue-700 font-black text-xs rounded-xl text-center shadow-lg border border-white/50 flex items-center justify-center gap-1 hover:bg-yellow-400 transition-colors"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {labels.read}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(book.id); }}
                  className="flex-1 py-2 bg-blue-500 text-white font-black text-xs rounded-xl text-center shadow-lg border border-white/50 flex items-center justify-center gap-1 hover:bg-blue-600 transition-colors"
                  style={{ fontFamily: 'Comic Sans MS, cursive' }}
                >
                  <Edit className="w-3.5 h-3.5" />
                  {labels.edit}
                </button>
              </div>

              {/* Acciones secundarias */}
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onPublish(book); }}
                  disabled={isPublishing}
                  className="flex-1 py-1.5 bg-white/90 backdrop-blur-sm text-blue-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1 hover:bg-white transition-colors disabled:opacity-50"
                >
                  {isPublishing ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : book.status === 'published' ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                  <span className="truncate">{book.status === 'published' ? labels.unpublish : labels.publish}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onStats(book.id); }}
                  className="p-1.5 bg-white/90 backdrop-blur-sm text-blue-700 rounded-lg hover:bg-white transition-colors"
                  title={labels.stats}
                >
                  <BarChart2 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onTrash(book); }}
                  className="p-1.5 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  title={labels.moveToTrash}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-2.5 space-y-1">
            <h3
              className="text-sm font-bold text-blue-800 line-clamp-2 leading-tight"
              style={{ fontFamily: 'Comic Sans MS, cursive' }}
            >
              {book.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              {book.pageCount > 0 && (
                <span className="flex items-center gap-0.5">
                  <FileText className="w-3 h-3" />
                  {book.pageCount} {labels.pages}
                </span>
              )}
              {book.status === 'published' && (
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  {book.viewCount} {labels.views}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-200/0 via-white/0 to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
      </article>
    );
  }
);

WriterBookCard.displayName = 'WriterBookCard';

/**
 * UBICACION: src/presentation/features/books/components/Inputs/AuthorSelector.tsx
 * Selector de autores con busqueda de usuarios del sistema
 * - Usuario actual agregado por defecto
 * - Busqueda de usuarios por email/nombre
 * - Roles: author, illustrator, translator, editor
 * - Todas las etiquetas usan traducciones de Supabase
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, User, UserPlus, Crown, Loader2 } from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { BookAuthor } from '@/src/presentation/features/books/hooks/useBookFormMultilang';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';

// Simple debounce helper
function useDebounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

interface AuthorSelectorProps {
  selectedAuthors: BookAuthor[];
  onChange: (authors: BookAuthor[]) => void;
  currentUser: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  maxAuthors?: number;
}

interface SearchResult {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

// Los roles ahora usan claves de traduccion
const AUTHOR_ROLE_KEYS = ['author', 'illustrator', 'translator', 'editor'] as const;

export function AuthorSelector({
  selectedAuthors,
  onChange,
  currentUser,
  maxAuthors = 10,
}: AuthorSelectorProps) {
  const supabase = createClient();
  const { t } = useSupabaseTranslations('books_form');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Agregar usuario actual por defecto al montar el componente
  useEffect(() => {
    if (currentUser && selectedAuthors.length === 0) {
      onChange([{
        userId: currentUser.id,
        email: currentUser.email,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        role: 'author',
      }]);
    }
  }, [currentUser]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Funcion de busqueda de usuarios
  const performSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
      try {
        const { data, error } = await supabase.rpc('search_users_by_email', {
          search_email: term,
        });

        if (error) {
          console.error('Error buscando usuarios:', error);
          setSearchResults([]);
        } else {
          // Filtrar usuarios ya seleccionados
          const selectedIds = selectedAuthors.map(a => a.userId);
          const filtered = (data || []).filter(
            (u: SearchResult) => !selectedIds.includes(u.user_id)
          );
          setSearchResults(filtered.slice(0, 8));
        }
    } catch (err) {
      console.error('Error en busqueda:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [selectedAuthors, supabase]);

  // Busqueda con debounce
  const searchUsers = useDebounce(performSearch, 300);

  // Ejecutar busqueda cuando cambia el termino
  useEffect(() => {
    if (searchTerm.trim()) {
      searchUsers(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const addAuthor = (user: SearchResult) => {
    if (selectedAuthors.length >= maxAuthors) return;
    if (selectedAuthors.some(a => a.userId === user.user_id)) return;

    const newAuthor: BookAuthor = {
      userId: user.user_id,
      email: user.email,
      displayName: user.full_name || user.email.split('@')[0],
      avatarUrl: user.avatar_url,
      role: 'author',
    };

    onChange([...selectedAuthors, newAuthor]);
    setSearchTerm('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const removeAuthor = (userId: string) => {
    // No permitir eliminar si solo queda un autor
    if (selectedAuthors.length <= 1) return;
    onChange(selectedAuthors.filter(a => a.userId !== userId));
  };

  const updateAuthorRole = (userId: string, role: BookAuthor['role']) => {
    onChange(
      selectedAuthors.map(a =>
        a.userId === userId ? { ...a, role } : a
      )
    );
  };

  const isCurrentUser = (userId: string) => currentUser?.id === userId;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
          <User size={13} />
          {t('authors_label')} <span className="text-red-500">{t('required')}</span>
          <span className="text-gray-400 font-normal">
            ({selectedAuthors.length}/{maxAuthors})
          </span>
        </label>
      </div>

      {/* Lista de autores seleccionados */}
      <div className="space-y-2">
        {selectedAuthors.map((author, idx) => (
          <div
            key={author.userId}
            className={`flex items-center gap-2 p-2 rounded-lg border ${
              isCurrentUser(author.userId)
                ? 'bg-amber-50 border-amber-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 relative">
              {author.avatarUrl ? (
                <img
                  src={author.avatarUrl}
                  alt={author.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                  {author.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {isCurrentUser(author.userId) && (
                <Crown
                  size={10}
                  className="absolute -top-1 -right-1 text-amber-500 fill-amber-500"
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate flex items-center gap-1">
                {author.displayName}
                {isCurrentUser(author.userId) && (
                  <span className="text-[9px] text-amber-600 bg-amber-100 px-1 rounded">
                    {t('authors_you')}
                  </span>
                )}
              </p>
              <p className="text-[10px] text-gray-500 truncate">{author.email}</p>
            </div>

            {/* Selector de rol */}
            <select
              value={author.role}
              onChange={(e) => updateAuthorRole(author.userId, e.target.value as BookAuthor['role'])}
              className="text-[10px] px-1.5 py-1 border border-gray-300 rounded bg-white focus:border-amber-400 focus:outline-none"
            >
              {AUTHOR_ROLE_KEYS.map(roleKey => (
                <option key={roleKey} value={roleKey}>
                  {t(`role_${roleKey}`)}
                </option>
              ))}
            </select>

            {/* Boton eliminar */}
            {selectedAuthors.length > 1 && (
              <button
                onClick={() => removeAuthor(author.userId)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                title={t('authors_remove')}
              >
                <X size={14} className="text-red-500" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Buscador de co-autores */}
      {selectedAuthors.length < maxAuthors && (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={t('authors_search')}
              className="w-full pl-8 pr-8 py-2 text-xs border border-gray-300 rounded-lg focus:border-amber-400 focus:ring-1 focus:ring-amber-200 focus:outline-none"
            />
            {isSearching && (
              <Loader2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Dropdown de resultados */}
          {showDropdown && (searchResults.length > 0 || (searchTerm.length >= 2 && !isSearching)) && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <button
                    key={user.user_id}
                    onClick={() => addAuthor(user)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-50 transition-colors text-left"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xs">
                        {(user.full_name || user.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {user.full_name || user.email.split('@')[0]}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    <UserPlus size={14} className="text-amber-500 flex-shrink-0" />
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-gray-500">{t('authors_no_results')}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {t('authors_try_other')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hint */}
      <p className="text-[10px] text-gray-400">
        {t('authors_hint')}
      </p>
    </div>
  );
}

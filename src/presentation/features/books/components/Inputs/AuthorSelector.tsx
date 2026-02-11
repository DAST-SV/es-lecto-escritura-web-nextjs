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
    // No permitir eliminar el usuario actual ni si solo queda un autor
    if (currentUser && userId === currentUser.id) return;
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

  const Avatar = ({ url, name, size = 8 }: { url: string | null; name: string; size?: number }) => {
    const [imgError, setImgError] = React.useState(false);
    const sizeClass = size === 7 ? 'w-7 h-7' : 'w-8 h-8';
    const textSize = size === 7 ? 'text-[10px]' : 'text-xs';
    if (url && !imgError) {
      return (
        <img src={url} alt={name} onError={() => setImgError(true)}
          className={`${sizeClass} rounded-full object-cover border border-gray-200 flex-shrink-0`} />
      );
    }
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white ${textSize} font-bold flex-shrink-0`}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Lista de autores seleccionados */}
      <div className="space-y-1.5">
        {selectedAuthors.map((author) => (
          <div key={author.userId}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${
              isCurrentUser(author.userId) ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
            }`}>
            <div className="relative flex-shrink-0">
              <Avatar url={author.avatarUrl} name={author.displayName} />
              {isCurrentUser(author.userId) && (
                <Crown size={9} className="absolute -top-0.5 -right-0.5 text-amber-500 fill-amber-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate leading-tight">
                {author.displayName}
                {isCurrentUser(author.userId) && (
                  <span className="ml-1 text-[8px] text-amber-600 bg-amber-100 px-1 py-0.5 rounded font-bold">{t('authors_you')}</span>
                )}
              </p>
              <p className="text-[9px] text-gray-400 truncate">{author.email}</p>
            </div>
            {isCurrentUser(author.userId) ? (
              <div className="text-[10px] px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded text-amber-700 font-bold flex-shrink-0">
                {t('role_author')}
              </div>
            ) : (
              <select value={author.role}
                onChange={(e) => updateAuthorRole(author.userId, e.target.value as BookAuthor['role'])}
                className="text-[10px] px-1 py-0.5 border border-gray-200 rounded bg-white focus:border-amber-400 focus:outline-none text-gray-600 flex-shrink-0">
                {AUTHOR_ROLE_KEYS.map(rk => (
                  <option key={rk} value={rk}>{t(`role_${rk}`)}</option>
                ))}
              </select>
            )}
            {selectedAuthors.length > 1 && !isCurrentUser(author.userId) && (
              <button onClick={() => removeAuthor(author.userId)}
                className="p-0.5 hover:bg-red-100 rounded transition-colors flex-shrink-0">
                <X size={12} className="text-red-400" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Buscador */}
      {selectedAuthors.length < maxAuthors && (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input ref={inputRef} type="text" value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              placeholder={t('authors_search')}
              className="w-full pl-7 pr-7 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-amber-400 focus:ring-1 focus:ring-amber-100 focus:outline-none" />
            {isSearching && <Loader2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
          </div>

          {/* Dropdown — fixed position para evitar overflow-hidden del padre */}
          {showDropdown && (searchResults.length > 0 || (searchTerm.length >= 2 && !isSearching)) && (
            <div
              className="fixed z-[9998] bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto"
              style={{
                width: inputRef.current ? inputRef.current.getBoundingClientRect().width : 240,
                left: inputRef.current ? inputRef.current.getBoundingClientRect().left : 0,
                top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 4 : 0,
                maxHeight: 220,
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.map(user => (
                  <button key={user.user_id} onClick={() => addAuthor(user)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-50 transition-colors text-left border-b border-gray-50 last:border-0">
                    <Avatar url={user.avatar_url} name={user.full_name || user.email} size={7} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{user.full_name || user.email.split('@')[0]}</p>
                      <p className="text-[9px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    <UserPlus size={13} className="text-amber-500 flex-shrink-0" />
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-gray-500">{t('authors_no_results')}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{t('authors_try_other')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <p className="text-[9px] text-gray-400">{t('authors_hint')}</p>
    </div>
  );
}

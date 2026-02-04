// ============================================
// src/presentation/features/reading-sessions/hooks/useReadingSessionsManager.ts
// Hook para gestión de sesiones de lectura
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReadingSessionEntity } from '@/src/core/domain/entities/ReadingSessionEntity';
import {
  getAllReadingSessions,
  startReadingSession,
  endReadingSession,
  deleteReadingSession,
} from '@/src/core/application/use-cases/reading-sessions';
import { CreateReadingSessionDTO, EndReadingSessionDTO } from '@/src/core/domain/repositories/IReadingSessionRepository';

export function useReadingSessionsManager() {
  const [sessions, setSessions] = useState<ReadingSessionEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllReadingSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const start = async (data: CreateReadingSessionDTO) => { const r = await startReadingSession(data); await loadSessions(); return r; };
  const end = async (id: string, data: EndReadingSessionDTO) => { const r = await endReadingSession(id, data); await loadSessions(); return r; };
  const remove = async (id: string) => { await deleteReadingSession(id); await loadSessions(); };

  return { sessions, loading, error, refresh: loadSessions, start, end, remove };
}

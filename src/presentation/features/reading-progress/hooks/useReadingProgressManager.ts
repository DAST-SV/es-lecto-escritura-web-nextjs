// ============================================
// src/presentation/features/reading-progress/hooks/useReadingProgressManager.ts
// Hook para gestión de progreso de lectura
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReadingProgressEntity } from '@/src/core/domain/entities/ReadingProgressEntity';
import {
  getAllReadingProgress,
  createReadingProgress,
  updateReadingProgress,
  upsertReadingProgress,
  markBookAsCompleted,
  addReadingTime,
  deleteReadingProgress,
} from '@/src/core/application/use-cases/reading-progress';
import { CreateReadingProgressDTO, UpdateReadingProgressDTO } from '@/src/core/domain/repositories/IReadingProgressRepository';

export function useReadingProgressManager() {
  const [progress, setProgress] = useState<ReadingProgressEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllReadingProgress();
      setProgress(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const create = async (data: CreateReadingProgressDTO) => { const r = await createReadingProgress(data); await loadProgress(); return r; };
  const update = async (id: string, data: UpdateReadingProgressDTO) => { const r = await updateReadingProgress(id, data); await loadProgress(); return r; };
  const upsert = async (data: CreateReadingProgressDTO & UpdateReadingProgressDTO) => { const r = await upsertReadingProgress(data); await loadProgress(); return r; };
  const markCompleted = async (id: string) => { await markBookAsCompleted(id); await loadProgress(); };
  const addTime = async (id: string, seconds: number) => { await addReadingTime(id, seconds); await loadProgress(); };
  const remove = async (id: string) => { await deleteReadingProgress(id); await loadProgress(); };

  return { progress, loading, error, refresh: loadProgress, create, update, upsert, markCompleted, addTime, remove };
}

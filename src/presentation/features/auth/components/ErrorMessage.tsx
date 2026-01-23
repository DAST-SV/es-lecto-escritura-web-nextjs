// ============================================
// src/presentation/features/auth/components/ErrorMessage.tsx
// ============================================
"use client";

import React from 'react';

interface ErrorMessageProps {
  error?: string;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
      {error}
    </div>
  );
}
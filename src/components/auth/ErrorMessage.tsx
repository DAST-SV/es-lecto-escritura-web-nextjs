"use client";

import React from 'react';

interface ErrorMessageProps {
  error?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
      {error}
    </div>
  );
};

export default ErrorMessage;
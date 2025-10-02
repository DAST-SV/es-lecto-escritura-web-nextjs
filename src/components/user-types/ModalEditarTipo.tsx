"use client";

import { useState, useEffect } from "react";
import { UserType } from "@/src/components/user-types/types";

interface ModalEditarTipoProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  tipo: UserType | null;
}

export default function ModalEditarTipo({
  isOpen,
  onClose,
  onUpdated,
  tipo,
}: ModalEditarTipoProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  // Sincronizar con el tipo seleccionado
  useEffect(() => {
    if (tipo) {
      setNombre(tipo.nombre);
      setDescripcion(tipo.descripcion || "");
    }
  }, [tipo]);

  if (!isOpen || !tipo) return null;

  const handleClose = () => {
    setNombre("");
    setDescripcion("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/users/usertypes/${tipo.id_tipo_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert("Error: " + data.error);
      } else {
        setNombre("");
        setDescripcion("");
        onUpdated();
        onClose();
      }
    } catch (error) {
      alert("Error inesperado al actualizar tipo de usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-blue-400 via-blue-300 to-green-300 p-1 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            Editar Tipo de Usuario
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ID
              </label>
              <input
                type="text"
                value={tipo.id_tipo_usuario}
                disabled
                className="w-full px-3 py-2 border border-slate-300 text-slate-500 bg-slate-50 rounded-lg shadow-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-text"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 text-slate-900 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-text resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white py-2 px-4 rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? "Guardando..." : "Actualizar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
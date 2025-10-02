"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface UserType {
  id_tipo_usuario: number;
  nombre: string;
  descripcion: string | null;
}

interface ModalEliminarTipoProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
  tipo: UserType | null;
}

export default function ModalEliminarTipo({
  isOpen,
  onClose,
  onDeleted,
  tipo,
}: ModalEliminarTipoProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !tipo) return null;

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/users/usertypes/${tipo.id_tipo_usuario}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert("Error: " + data.error);
      } else {
        onDeleted();
        onClose();
      }
    } catch (error) {
      alert("Error inesperado al eliminar tipo de usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-red-400 via-red-300 to-orange-300 p-1 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Eliminar Tipo de Usuario
            </h2>
          </div>

          <div className="mb-6">
            <p className="text-slate-700 mb-4">
              ¿Está seguro que desea eliminar el siguiente tipo de usuario?
            </p>
            
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="mb-2">
                <span className="text-xs font-semibold text-slate-500">ID:</span>
                <p className="text-sm font-bold text-teal-600">#{tipo.id_tipo_usuario}</p>
              </div>
              <div className="mb-2">
                <span className="text-xs font-semibold text-slate-500">Nombre:</span>
                <p className="text-sm font-bold text-slate-800">{tipo.nombre}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500">Descripción:</span>
                <p className="text-sm text-slate-600">{tipo.descripcion || "Sin descripción"}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Esta acción no se puede deshacer
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
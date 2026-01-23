// ============================================
// src/presentation/features/organizations/components/MembersModal.tsx
// ============================================

import { Users, X, UserPlus } from 'lucide-react';
import { Organization } from '@/src/core/domain/entities/Organization';
import { useOrganizationMembers } from '../hooks/useOrganizationMembers';

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
}

export function MembersModal({ isOpen, onClose, organization }: MembersModalProps) {
  const { members, loading, error } = useOrganizationMembers(organization?.id || '');

  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">Miembros</h2>
              <p className="text-sm text-slate-500">{organization.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Cargando miembros...</p>
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-400 mb-2">Sin miembros</p>
            <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invitar Miembros
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {members.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{member.userId}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                        {member.role}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        member.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : member.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAuthTranslations } from '../hooks/useAuthTranslations';

type RoleType = 'student' | 'teacher' | 'parent' | 'school' | 'individual';

interface RoleSelectorProps {
  selectedRole: RoleType | null;
  onSelectRole: (role: RoleType) => void;
}

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  const { roles, register, loading } = useAuthTranslations();

  const rolesList: RoleType[] = ['student', 'teacher', 'parent', 'school', 'individual'];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {register.roleLabel}
        </h3>
        <p className="text-sm text-gray-600">
          {register.roleDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {rolesList.map((role) => {
          const isSelected = selectedRole === role;
          const roleData = roles[role];

          return (
            <motion.button
              key={role}
              type="button"
              onClick={() => onSelectRole(role)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-3xl flex-shrink-0">
                  {roleData.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4 className={`font-bold mb-1 ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                    {roleData.name}
                  </h4>
                  <p className={`text-sm ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                    {roleData.description}
                  </p>
                </div>

                {/* Check Icon */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
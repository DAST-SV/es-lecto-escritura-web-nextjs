'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAuthTranslations } from '../hooks/useAuthTranslations';

type RoleType = 'student' | 'teacher' | 'parent' | 'school' | 'individual';

interface RoleSelectorProps {
  selectedRole: RoleType | null;
  onSelectRole: (role: RoleType) => void;
}

const ROLE_COLORS: Record<RoleType, { bg: string; border: string; text: string; accent: string }> = {
  student:    { bg: 'bg-blue-50',   border: 'border-blue-300',  text: 'text-blue-700',   accent: 'bg-blue-500' },
  teacher:    { bg: 'bg-green-50',  border: 'border-green-300', text: 'text-green-700',  accent: 'bg-green-500' },
  parent:     { bg: 'bg-purple-50', border: 'border-purple-300',text: 'text-purple-700', accent: 'bg-purple-500' },
  school:     { bg: 'bg-orange-50', border: 'border-orange-300',text: 'text-orange-700', accent: 'bg-orange-500' },
  individual: { bg: 'bg-cyan-50',   border: 'border-cyan-300',  text: 'text-cyan-700',   accent: 'bg-cyan-500' },
};

// Fallback hardcodeado — la UI SIEMPRE funciona aunque las traducciones de DB fallen
const ROLE_DEFAULTS: Record<RoleType, { icon: string; name: string; description: string }> = {
  student:    { icon: '🎓', name: 'Estudiante',        description: 'Quiero aprender a leer y escribir' },
  teacher:    { icon: '📚', name: 'Maestro/a',          description: 'Quiero enseñar a mis estudiantes' },
  parent:     { icon: '👨‍👩‍👧', name: 'Padre/Madre',       description: 'Quiero ayudar a mis hijos' },
  school:     { icon: '🏫', name: 'Escuela',            description: 'Quiero gestionar mi institución' },
  individual: { icon: '🧑‍💻', name: 'Usuario Individual', description: 'Quiero aprender por mi cuenta' },
};

/** Devuelve el valor de la traducción si existe, o el fallback si es una key cruda [xxx] */
function resolve(translated: string | undefined, fallback: string): string {
  if (!translated || translated.startsWith('[')) return fallback;
  return translated;
}

export function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  const { roles, register, loading } = useAuthTranslations();

  const rolesList: RoleType[] = ['student', 'teacher', 'parent', 'school', 'individual'];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-blue-50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3
          className="text-lg font-black text-blue-700 mb-1"
          style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
        >
          {resolve(register.roleLabel, '¿Quién eres?')}
        </h3>
        <p
          className="text-sm font-bold text-blue-400"
          style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
        >
          {resolve(register.roleDescription, 'Selecciona tu perfil para personalizar tu experiencia')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {rolesList.map((role, index) => {
          const isSelected = selectedRole === role;
          const d = ROLE_DEFAULTS[role];
          const tr = roles[role];
          const roleData = {
            icon: resolve(tr?.icon, d.icon),
            name: resolve(tr?.name, d.name),
            description: resolve(tr?.description, d.description),
          };
          const colors = ROLE_COLORS[role];

          return (
            <motion.button
              key={role}
              type="button"
              onClick={() => onSelectRole(role)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              className={`
                relative p-4 rounded-2xl border-2 text-left transition-all duration-200
                ${isSelected
                  ? `${colors.bg} ${colors.border} shadow-lg scale-[1.02]`
                  : 'bg-white border-gray-200 hover:border-yellow-300 hover:shadow-md hover:scale-[1.01]'
                }
              `}
              whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <motion.div
                  className={`
                    w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
                    ${isSelected
                      ? `${colors.bg} border-2 ${colors.border}`
                      : 'bg-gray-50 border-2 border-gray-200'
                    }
                  `}
                  animate={isSelected ? { rotate: [0, -5, 5, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {roleData.icon}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-black text-base mb-0.5 ${isSelected ? colors.text : 'text-gray-700'}`}
                    style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
                  >
                    {roleData.name}
                  </h4>
                  <p
                    className={`text-xs font-bold leading-tight ${isSelected ? colors.text + '/70' : 'text-gray-400'}`}
                    style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
                  >
                    {roleData.description}
                  </p>
                </div>

                {/* Check Icon */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="flex-shrink-0"
                    >
                      <div className={`w-8 h-8 ${colors.accent} rounded-full flex items-center justify-center shadow-md`}>
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

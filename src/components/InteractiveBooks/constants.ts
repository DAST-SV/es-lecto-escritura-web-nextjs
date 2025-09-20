// constants.ts
import { Level, Book } from './types';

export const levelConfig: Level[] = [
  {
    id: 'preschool',
    name: 'Preescolar',
    ageRange: '3-5 años',
    description: 'Cuentos simples con ilustraciones grandes y palabras básicas',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'from-emerald-50 to-teal-50',
    textSize: 'large',
    features: ['Texto muy grande', 'Muchas imágenes', 'Palabras simples', 'Colores suaves']
  },
  {
    id: 'elementary',
    name: 'Primaria',
    ageRange: '6-8 años',
    description: 'Historias más elaboradas que desarrollan la comprensión lectora',
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'from-indigo-50 to-blue-50',
    textSize: 'medium',
    features: ['Oraciones completas', 'Más texto', 'Vocabulario ampliado', 'Conceptos básicos']
  },
  {
    id: 'intermediate',
    name: 'Intermedio',
    ageRange: '9-12 años',
    description: 'Cuentos complejos que desafían la imaginación y pensamiento crítico',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'from-violet-50 to-purple-50',
    textSize: 'small',
    features: ['Párrafos largos', 'Tramas complejas', 'Vocabulario avanzado', 'Moralejas profundas']
  }
];

export const booksByLevel: { [key: string]: Book[] } = {
  preschool: [
    {
      id: '1',
      title: 'La Ranita Saltarina',
      description: 'Acompaña a Rita en su gran aventura por el estanque.',
      duration: '5 min',
      difficulty: 'easy',
      isPremium: false,
      coverImage: '🐸',
      coverColor: 'from-green-400 via-lime-400 to-green-500',
      ageRange: '3-5 años',
      level: 'preschool',
      category: 'Animales',
      pages: [
        {
          content: 'Rita es una ranita verde muy especial que vive en un hermoso estanque lleno de flores.',
          image: '🐸',
          title: 'Conoce a Rita',
          backgroundColor: 'from-slate-50 to-gray-100',
          textSize: 'large',
          words: [
            { text: 'Rita', start: 0, end: 0.5 },
            { text: 'es', start: 0.5, end: 0.7 },
            { text: 'una', start: 0.7, end: 0.9 },
            { text: 'ranita', start: 0.9, end: 1.3 },
            { text: 'verde', start: 1.3, end: 1.6 },
            { text: 'muy', start: 1.6, end: 1.8 },
            { text: 'especial', start: 1.8, end: 2.3 }
          ]
        },
        {
          content: 'Todos los días, Rita salta muy alto entre las hojas de loto del estanque.',
          image: '🌿',
          title: 'Rita Salta Alto',
          backgroundColor: 'from-blue-50 to-slate-100',
          textSize: 'large'
        },
        {
          content: 'Al final del día, Rita regresa feliz a su casa en el estanque.',
          image: '🏠',
          title: 'De Vuelta a Casa',
          backgroundColor: 'from-violet-50 to-purple-100',
          textSize: 'large'
        }
      ]
    },
    {
      id: '2',
      title: 'El Sol Sonriente',
      description: 'El sol nos cuenta por qué está tan feliz cada mañana.',
      duration: '7 min',
      difficulty: 'easy',
      isPremium: false,
      coverImage: '🌞',
      coverColor: 'from-yellow-400 via-orange-400 to-red-400',
      ageRange: '3-5 años',
      level: 'preschool',
      category: 'Naturaleza',
      pages: [
        {
          content: 'El sol despierta muy temprano todas las mañanas.',
          image: '🌅',
          title: 'Buenos Días',
          backgroundColor: 'from-yellow-100 to-orange-100',
          textSize: 'large'
        },
        {
          content: 'Sonríe a todos los niños del mundo entero.',
          image: '😊',
          title: 'Una Gran Sonrisa',
          backgroundColor: 'from-orange-100 to-pink-100',
          textSize: 'large'
        }
      ]
    }
  ],
  elementary: [
    {
      id: '3',
      title: 'La Aventura del Dragón Azul',
      description: 'Un dragón mágico que ayuda a los niños en un reino lejano.',
      duration: '15 min',
      difficulty: 'medium',
      isPremium: false,
      coverImage: '🐲',
      coverColor: 'from-blue-400 via-purple-400 to-blue-600',
      ageRange: '6-8 años',
      level: 'elementary',
      category: 'Fantasía',
      pages: [
        {
          content: 'Había una vez un dragón azul que vivía en las montañas más altas del reino. Su nombre era Azulino y tenía un corazón muy bondadoso.',
          image: '🐉',
          title: 'El Dragón de las Montañas',
          backgroundColor: 'from-blue-100 to-purple-100',
          textSize: 'medium'
        },
        {
          content: 'Este dragón era diferente a todos los demás. Era amable, generoso y le encantaba ayudar a todos los que necesitaran su ayuda.',
          image: '🏔️',
          title: 'Un Dragón Especial',
          backgroundColor: 'from-green-100 to-blue-100',
          textSize: 'medium'
        }
      ]
    }
  ],
  intermediate: [
    {
      id: '4',
      title: 'El Castillo de los Sueños Perdidos',
      description: 'Una aventura épica sobre el valor, la amistad y el poder de los sueños.',
      duration: '25 min',
      difficulty: 'hard',
      isPremium: true,
      coverImage: '🏰',
      coverColor: 'from-purple-400 via-pink-400 to-indigo-600',
      ageRange: '9-12 años',
      level: 'intermediate',
      category: 'Aventura',
      pages: [
        {
          content: 'En lo alto de una colina envuelta en niebla perpetua se alzaba un castillo que guardaba los secretos más profundos del reino.',
          image: '🏰',
          title: 'El Castillo Misterioso',
          backgroundColor: 'from-purple-100 to-indigo-100',
          textSize: 'small'
        }
      ]
    }
  ]
};

export const textStyles = {
  large: 'text-2xl md:text-3xl leading-relaxed font-bold',
  medium: 'text-lg md:text-xl leading-relaxed font-semibold',
  small: 'text-sm md:text-base leading-relaxed font-medium'
};

export const difficultyColors = {
  easy: 'bg-green-200 text-green-900 border-green-300',
  medium: 'bg-yellow-200 text-yellow-900 border-yellow-300',
  hard: 'bg-red-200 text-red-900 border-red-300'
};
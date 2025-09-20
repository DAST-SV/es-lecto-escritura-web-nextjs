import type { ContentCategory } from '../type';

export const contentCategories: ContentCategory[] = [
  {
    id: 'cuentos',
    name: 'Cuentos',
    icon: '📖',
    description: 'Historias mágicas que despiertan la imaginación',
    color: 'blue',
    bgGradient: 'from-blue-400 to-blue-600',
    levels: [
      {
        id: 'nivel1',
        name: 'Nivel 1',
        ageRange: '3-5 años',
        description: 'Cuentos sencillos con imágenes grandes y pocas palabras',
        color: 'green'
      },
      {
        id: 'nivel2',
        name: 'Nivel 2',
        ageRange: '6-8 años',
        description: 'Cuentos con más texto y vocabulario básico',
        color: 'yellow'
      },
      {
        id: 'nivel3',
        name: 'Nivel 3',
        ageRange: '9-12 años',
        description: 'Cuentos complejos con moralejas profundas',
        color: 'orange'
      }
    ],
    previewContent: [
      {
        id: 'cuento1',
        title: 'La Princesa y el Dragón',
        description: 'Una valiente princesa descubre que la amistad puede conquistar cualquier miedo.',
        imageUrl: '/images/preview/cuento1.jpg',
        difficulty: 'easy',
        duration: '5 min',
        isPremium: true
      },
      {
        id: 'cuento2',
        title: 'El Bosque Encantado',
        description: 'Un niño aventurero encuentra criaturas mágicas en un bosque misterioso.',
        imageUrl: '/images/preview/cuento2.jpg',
        difficulty: 'medium',
        duration: '7 min',
        isPremium: true
      },
      {
        id: 'cuento3',
        title: 'El Tesoro del Pirata',
        description: 'Una búsqueda del tesoro que enseña el valor de la perseverancia.',
        imageUrl: '/images/preview/cuento3.jpg',
        difficulty: 'medium',
        duration: '8 min',
        isPremium: true
      }
    ]
  },
  {
    id: 'fabulas',
    name: 'Fábulas',
    icon: '🦊',
    description: 'Historias con animales que enseñan valores importantes',
    color: 'green',
    bgGradient: 'from-green-400 to-green-600',
    levels: [
      {
        id: 'nivel1',
        name: 'Nivel 1',
        ageRange: '4-6 años',
        description: 'Fábulas cortas con enseñanzas simples',
        color: 'green'
      },
      {
        id: 'nivel2',
        name: 'Nivel 2',
        ageRange: '7-9 años',
        description: 'Fábulas clásicas con moralejas claras',
        color: 'yellow'
      },
      {
        id: 'nivel3',
        name: 'Nivel 3',
        ageRange: '10-13 años',
        description: 'Fábulas complejas para reflexionar',
        color: 'orange'
      }
    ],
    previewContent: [
      {
        id: 'fabula1',
        title: 'La Liebre y la Tortuga',
        description: 'Una carrera que enseña que la constancia vence a la rapidez.',
        imageUrl: '/images/preview/fabula1.jpg',
        difficulty: 'easy',
        duration: '4 min',
        isPremium: true
      },
      {
        id: 'fabula2',
        title: 'El León y el Ratón',
        description: 'Una historia sobre cómo los pequeños gestos pueden ser grandes.',
        imageUrl: '/images/preview/fabula2.jpg',
        difficulty: 'easy',
        duration: '3 min',
        isPremium: true
      },
      {
        id: 'fabula3',
        title: 'La Cigarra y la Hormiga',
        description: 'Una lección sobre la importancia del trabajo y la previsión.',
        imageUrl: '/images/preview/fabula3.jpg',
        difficulty: 'medium',
        duration: '5 min',
        isPremium: true
      }
    ]
  },
  {
    id: 'poemas',
    name: 'Poemas',
    icon: '✒️',
    description: 'Versos que despiertan emociones y creatividad',
    color: 'purple',
    bgGradient: 'from-purple-400 to-purple-600',
    levels: [
      {
        id: 'nivel1',
        name: 'Nivel 1',
        ageRange: '4-6 años',
        description: 'Poemas cortos con rimas sencillas',
        color: 'green'
      },
      {
        id: 'nivel2',
        name: 'Nivel 2',
        ageRange: '7-10 años',
        description: 'Poemas con métrica y vocabulario variado',
        color: 'yellow'
      },
      {
        id: 'nivel3',
        name: 'Nivel 3',
        ageRange: '11-14 años',
        description: 'Poemas clásicos y contemporáneos',
        color: 'orange'
      }
    ],
    previewContent: [
      {
        id: 'poema1',
        title: 'Los Colores del Arcoíris',
        description: 'Un poema que celebra la diversidad y la belleza de los colores.',
        imageUrl: '/images/preview/poema1.jpg',
        difficulty: 'easy',
        duration: '2 min',
        isPremium: true
      },
      {
        id: 'poema2',
        title: 'El Vuelo de la Mariposa',
        description: 'Versos sobre transformación y libertad.',
        imageUrl: '/images/preview/poema2.jpg',
        difficulty: 'medium',
        duration: '3 min',
        isPremium: true
      },
      {
        id: 'poema3',
        title: 'Nanas de Luna',
        description: 'Poemas tranquilos para la hora de dormir.',
        imageUrl: '/images/preview/poema3.jpg',
        difficulty: 'easy',
        duration: '4 min',
        isPremium: true
      }
    ]
  },
  {
    id: 'historietas',
    name: 'Historietas',
    icon: '💬',
    description: 'Historias visuales llenas de diversión y aprendizaje',
    color: 'red',
    bgGradient: 'from-red-400 to-red-600',
    levels: [
      {
        id: 'nivel1',
        name: 'Nivel 1',
        ageRange: '5-7 años',
        description: 'Historietas con imágenes grandes y texto simple',
        color: 'green'
      },
      {
        id: 'nivel2',
        name: 'Nivel 2',
        ageRange: '8-10 años',
        description: 'Historietas con diálogos y narrativa básica',
        color: 'yellow'
      },
      {
        id: 'nivel3',
        name: 'Nivel 3',
        ageRange: '11-13 años',
        description: 'Historietas con tramas complejas',
        color: 'orange'
      }
    ],
    previewContent: [
      {
        id: 'historieta1',
        title: 'Las Aventuras de Pepito',
        description: 'Un niño curioso descubre el mundo que lo rodea.',
        imageUrl: '/images/preview/historieta1.jpg',
        difficulty: 'easy',
        duration: '6 min',
        isPremium: true
      },
      {
        id: 'historieta2',
        title: 'Super Eco',
        description: 'Un superhéroe que enseña a cuidar el medio ambiente.',
        imageUrl: '/images/preview/historieta2.jpg',
        difficulty: 'medium',
        duration: '8 min',
        isPremium: true
      },
      {
        id: 'historieta3',
        title: 'Los Amigos del Barrio',
        description: 'Historias de amistad y convivencia urbana.',
        imageUrl: '/images/preview/historieta3.jpg',
        difficulty: 'medium',
        duration: '7 min',
        isPremium: true
      }
    ]
  },
  {
    id: 'adivinanzas',
    name: 'Adivinanzas',
    icon: '❓',
    description: 'Acertijos divertidos que estimulan el pensamiento',
    color: 'yellow',
    bgGradient: 'from-yellow-400 to-yellow-600',
    levels: [
      {
        id: 'nivel1',
        name: 'Nivel 1',
        ageRange: '4-6 años',
        description: 'Adivinanzas sencillas con pistas visuales',
        color: 'green'
      },
      {
        id: 'nivel2',
        name: 'Nivel 2',
        ageRange: '7-9 años',
        description: 'Adivinanzas con rimas y juegos de palabras',
        color: 'yellow'
      },
      {
        id: 'nivel3',
        name: 'Nivel 3',
        ageRange: '10-12 años',
        description: 'Adivinanzas complejas y desafiantes',
        color: 'orange'
      }
    ],
    previewContent: [
      {
        id: 'adivinanza1',
        title: 'Animales del Bosque',
        description: 'Descubre qué animal se esconde detrás de cada pista.',
        imageUrl: '/images/preview/adivinanza1.jpg',
        difficulty: 'easy',
        duration: '10 min',
        isPremium: true
      },
      {
        id: 'adivinanza2',
        title: 'Objetos Cotidianos',
        description: 'Adivinanzas sobre cosas que usamos todos los días.',
        imageUrl: '/images/preview/adivinanza2.jpg',
        difficulty: 'medium',
        duration: '12 min',
        isPremium: true
      },
      {
        id: 'adivinanza3',
        title: 'Misterios de la Naturaleza',
        description: 'Acertijos sobre fenómenos naturales fascinantes.',
        imageUrl: '/images/preview/adivinanza3.jpg',
        difficulty: 'hard',
        duration: '15 min',
        isPremium: true
      }
    ]
  }
];
// src/types/interactiveElements.ts
export type InteractionType = "pickup" | "open" | "talk" | "attack" | "custom";

export interface InteractiveElement {
  id: string;                // Identificador único
  name: string;              // Nombre descriptivo (ej: "Puerta", "Cofre", "NPC")
  description?: string;      // Texto opcional explicando qué es o qué hace
  type: InteractionType;     // Tipo de interacción que permite
  position: {                // Coordenadas en la escena
    x: number;
    y: number;
  };
  itemsRequired?: string[];  // IDs de objetos necesarios para interactuar
  itemsGranted?: string[];   // IDs de objetos que entrega tras interactuar
  isActive: boolean;         // Si está disponible o bloqueado
  onInteract?: () => void;   // Acción opcional a ejecutar al interactuar
}

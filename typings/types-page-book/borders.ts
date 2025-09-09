export const borders = {
  cuadrado: "0px",           // borde completamente cuadrado
  ligeramenteRedondeado: "4px",  // bordes sutilmente redondeados
  redondeado: "16px",        // bordes redondeados estándar
  circular: "50%",            // bordes totalmente circulares (útil para círculos)
  elipseHorizontal: "50% / 25%", // borde elíptico horizontal
  elipseVertical: "25% / 50%",   // borde elíptico vertical
  flor: "50% 20% 50% 20%",   // forma de pétalos (requiere verificar compatibilidad)
  diagonal: "10px 20px 30px 40px", // bordes con radios distintos en cada esquina
  pill: "9999px",             // forma tipo pastilla (botones redondeados extremos)
}as const;

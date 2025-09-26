import Image, { ImageProps, StaticImageData } from 'next/image';

/**
 * Componente funcional 'NextImage' que extiende las propiedades estándar de una imagen.
 * @param {ImageProps} props - Propiedades estándar de una imagen, incluyendo 'src', 'alt', 'width', 'height', etc.
 * @returns {JSX.Element} - Componente de imagen optimizado para rendimiento.
 */
export const NextImage: React.FC<ImageProps> = ({ src, alt, width, height, ...props }) => {
  // Verificamos si la fuente de la imagen es una URL externa que comienza con 'https://'.
  const isExternal = typeof src === 'string' && src.startsWith('https://');

  // Determinamos si la imagen debe ser optimizada por Next.js.
  // Si es externa, establecemos 'unoptimized' en 'true'; de lo contrario, lo dejamos como 'undefined'.
  const unoptimized = isExternal ? true : undefined;

  // Si la imagen es local, obtenemos la propiedad 'src' del objeto 'StaticImageData'.
  // Esto es necesario porque las imágenes locales importadas en Next.js son objetos de tipo 'StaticImageData'.
  const imageSrc = isExternal ? src : (src as StaticImageData)?.src;

  return (
    <Image
      {...props} // Pasamos todas las demás propiedades recibidas al componente 'Image'.
      src={imageSrc} // Establecemos la fuente de la imagen.
      alt={alt} // Establecemos el texto alternativo para la imagen.
      width={width} // Establecemos el ancho de la imagen.
      height={height} // Establecemos la altura de la imagen.
      unoptimized={unoptimized} // Establecemos si la imagen debe ser optimizada por Next.js.
      priority={props.priority || false} // Establecemos si la imagen tiene prioridad de carga.
      style={{ width: width, height: height }} // Ajustamos el tamaño manteniendo la relación de aspecto.
    />
  );
};
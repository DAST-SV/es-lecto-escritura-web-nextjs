import { notFound } from "next/navigation";

export default function SlugPage({ params }: { params: { slug: string } }) {
  const slugsValidos = ["algo", "otro-libro"];

  if (!slugsValidos.includes(params.slug)) {
    notFound(); // dispara el not-found.tsx local
  }

  return (
    <div>
      <h1>Libro: {params.slug}</h1>
      <p>¡Bienvenido a la página de este libro!</p>
    </div>
  );
}

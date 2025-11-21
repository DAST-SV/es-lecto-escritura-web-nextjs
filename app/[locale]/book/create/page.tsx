import { BookEditorWithPreview } from '@/src/components/book-editor/components/BookEditorWithPreview';

export default function EditPage() {
  return (
    <BookEditorWithPreview
      bookTitle="Mi Libro"
      initialPages={[]}
      onSave={async (pages) => {
        console.log('Guardado!', pages);
      }}
    />
  );
}
// "use client";

// import { Book } from "@/src/components/components-for-books/book/create-edits-books/components/Book";

// const CreateBook: React.FC = () => {
//  return <Book/>
// }

// export default CreateBook;
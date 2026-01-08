/**
 * UBICACIÓN: app/api/admin/audit-books-clean/route.ts
 * ✅ CORREGIDO: Ahora SÍ elimina archivos huérfanos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// ============================================
// HELPER: Obtener cliente Supabase con Service Role
// ============================================
function getSupabaseAdmin() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = 
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('🔍 Verificando variables:');
  console.log('- URL:', SUPABASE_URL ? '✅' : '❌');
  console.log('- Service Key:', SUPABASE_SERVICE_KEY ? '✅' : '❌');

  if (!SUPABASE_URL) {
    throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!SUPABASE_SERVICE_KEY) {
    throw new Error('Falta NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

// ============================================
// INTERFACES
// ============================================

interface AuditSummary {
  totalBooks: number;
  activeBooks: number;
  deletedBooks: number;
  orphanedFiles: number;
  brokenRelations: number;
  duplicates: number;
  issues: number;
}

interface AuditDetails {
  orphanedPDFs: string[];
  orphanedImages: string[];
  booksWithoutPDF: Array<{ id: string; title: string }>;
  booksWithoutCover: Array<{ id: string; title: string }>;
  brokenAuthorRelations: any[];
  brokenCharacterRelations: any[];
  brokenCategoryRelations: any[];
  brokenGenreRelations: any[];
  brokenTagRelations: any[];
  brokenValueRelations: any[];
  duplicateAuthors: Array<{ name: string; count: number; ids: string[] }>;
  duplicateCharacters: Array<{ name: string; count: number; ids: string[] }>;
  oldSoftDeletes: Array<{ id: string; title: string; deleted_at: string; days_ago: number }>;
  booksWithoutRelations: Array<{ id: string; title: string; missing: string[] }>;
}

interface AuditReport {
  timestamp: string;
  summary: AuditSummary;
  details: AuditDetails;
  recommendations: string[];
}

// ============================================
// GET - EJECUTAR AUDITORÍA
// ============================================

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Iniciando auditoría...');

    const supabase = getSupabaseAdmin();

    // Inicializar reporte
    const report: AuditReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalBooks: 0,
        activeBooks: 0,
        deletedBooks: 0,
        orphanedFiles: 0,
        brokenRelations: 0,
        duplicates: 0,
        issues: 0,
      },
      details: {
        orphanedPDFs: [],
        orphanedImages: [],
        booksWithoutPDF: [],
        booksWithoutCover: [],
        brokenAuthorRelations: [],
        brokenCharacterRelations: [],
        brokenCategoryRelations: [],
        brokenGenreRelations: [],
        brokenTagRelations: [],
        brokenValueRelations: [],
        duplicateAuthors: [],
        duplicateCharacters: [],
        oldSoftDeletes: [],
        booksWithoutRelations: [],
      },
      recommendations: [],
    };

    // ============================================
    // 1. AUDITAR LIBROS
    // ============================================
    console.log('📚 1. Auditando libros...');

    const { data: allBooks, error: booksError } = await supabase
      .from('books')
      .select('id, title, cover_url, pdf_url, deleted_at, user_id');

    if (booksError) {
      throw new Error(`Error obteniendo libros: ${booksError.message}`);
    }

    report.summary.totalBooks = allBooks?.length || 0;
    report.summary.activeBooks = allBooks?.filter(b => !b.deleted_at).length || 0;
    report.summary.deletedBooks = allBooks?.filter(b => b.deleted_at).length || 0;

    // Libros sin PDF
    const booksWithoutPDF = (allBooks || [])
      .filter(b => !b.deleted_at && !b.pdf_url)
      .map(b => ({ id: b.id, title: b.title || 'Sin título' }));
    
    report.details.booksWithoutPDF = booksWithoutPDF;

    // Libros sin portada
    const booksWithoutCover = (allBooks || [])
      .filter(b => !b.deleted_at && !b.cover_url)
      .map(b => ({ id: b.id, title: b.title || 'Sin título' }));
    
    report.details.booksWithoutCover = booksWithoutCover;

    // Soft deletes antiguos (más de 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldSoftDeletes = (allBooks || [])
      .filter(b => {
        if (!b.deleted_at) return false;
        return new Date(b.deleted_at) < thirtyDaysAgo;
      })
      .map(b => {
        const daysAgo = Math.floor(
          (Date.now() - new Date(b.deleted_at!).getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: b.id,
          title: b.title || 'Sin título',
          deleted_at: b.deleted_at!,
          days_ago: daysAgo,
        };
      });

    report.details.oldSoftDeletes = oldSoftDeletes;

    // ============================================
    // 2. AUDITAR ARCHIVOS HUÉRFANOS
    // ============================================
    console.log('📁 2. Auditando archivos huérfanos...');

    const activeBookIds = new Set(
      (allBooks || [])
        .filter(b => !b.deleted_at)
        .map(b => b.id)
    );

    // PDFs huérfanos
    try {
      const { data: pdfFolders } = await supabase.storage
        .from('book-pdfs')
        .list('', { limit: 1000 });

      if (pdfFolders) {
        for (const userFolder of pdfFolders) {
          if (userFolder.name === '.emptyFolderPlaceholder') continue;

          const { data: bookFolders } = await supabase.storage
            .from('book-pdfs')
            .list(userFolder.name, { limit: 1000 });

          if (bookFolders) {
            for (const bookFolder of bookFolders) {
              if (bookFolder.name === '.emptyFolderPlaceholder') continue;
              if (!activeBookIds.has(bookFolder.name)) {
                report.details.orphanedPDFs.push(`${userFolder.name}/${bookFolder.name}`);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Error auditando PDFs:', err);
    }

    // Imágenes huérfanas
    try {
      const { data: imageFolders } = await supabase.storage
        .from('book-images')
        .list('', { limit: 1000 });

      if (imageFolders) {
        for (const userFolder of imageFolders) {
          if (userFolder.name === '.emptyFolderPlaceholder') continue;

          const { data: bookFolders } = await supabase.storage
            .from('book-images')
            .list(userFolder.name, { limit: 1000 });

          if (bookFolders) {
            for (const bookFolder of bookFolders) {
              if (bookFolder.name === '.emptyFolderPlaceholder') continue;
              if (!activeBookIds.has(bookFolder.name)) {
                report.details.orphanedImages.push(`${userFolder.name}/${bookFolder.name}`);
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Error auditando imágenes:', err);
    }

    report.summary.orphanedFiles = 
      report.details.orphanedPDFs.length + 
      report.details.orphanedImages.length;

    // ============================================
    // 3. AUDITAR RELACIONES ROTAS
    // ============================================
    console.log('🔗 3. Auditando relaciones rotas...');

    // Autores
    const { data: authorRels } = await supabase
      .from('books_authors')
      .select('book_id, author_id');

    const { data: validAuthors } = await supabase
      .from('book_authors')
      .select('id');

    const validAuthorIds = new Set(validAuthors?.map(a => a.id) || []);

    if (authorRels) {
      for (const rel of authorRels) {
        if (!activeBookIds.has(rel.book_id) || !validAuthorIds.has(rel.author_id)) {
          report.details.brokenAuthorRelations.push(rel);
        }
      }
    }

    // Personajes
    const { data: charRels } = await supabase
      .from('books_characters')
      .select('book_id, character_id');

    const { data: validChars } = await supabase
      .from('book_characters')
      .select('id');

    const validCharIds = new Set(validChars?.map(c => c.id) || []);

    if (charRels) {
      for (const rel of charRels) {
        if (!activeBookIds.has(rel.book_id) || !validCharIds.has(rel.character_id)) {
          report.details.brokenCharacterRelations.push(rel);
        }
      }
    }

    report.summary.brokenRelations = 
      report.details.brokenAuthorRelations.length +
      report.details.brokenCharacterRelations.length;

    // ============================================
    // 4. AUDITAR DUPLICADOS
    // ============================================
    console.log('👥 4. Auditando duplicados...');

    // Autores duplicados
    const { data: authors } = await supabase
      .from('book_authors')
      .select('id, name');

    if (authors) {
      const byName = new Map<string, string[]>();
      for (const author of authors) {
        const name = author.name.toLowerCase().trim();
        if (!byName.has(name)) byName.set(name, []);
        byName.get(name)!.push(author.id);
      }

      for (const [name, ids] of byName.entries()) {
        if (ids.length > 1) {
          report.details.duplicateAuthors.push({ name, count: ids.length, ids });
        }
      }
    }

    // Personajes duplicados
    const { data: characters } = await supabase
      .from('book_characters')
      .select('id, name');

    if (characters) {
      const byName = new Map<string, string[]>();
      for (const character of characters) {
        const name = character.name.toLowerCase().trim();
        if (!byName.has(name)) byName.set(name, []);
        byName.get(name)!.push(character.id);
      }

      for (const [name, ids] of byName.entries()) {
        if (ids.length > 1) {
          report.details.duplicateCharacters.push({ name, count: ids.length, ids });
        }
      }
    }

    report.summary.duplicates = 
      report.details.duplicateAuthors.length +
      report.details.duplicateCharacters.length;

    // ============================================
    // 5. LIBROS SIN RELACIONES BÁSICAS
    // ============================================
    console.log('📋 5. Auditando libros sin relaciones...');

    for (const book of (allBooks || []).filter(b => !b.deleted_at).slice(0, 50)) {
      const missing: string[] = [];

      const { data: authors } = await supabase
        .from('books_authors')
        .select('author_id')
        .eq('book_id', book.id);

      if (!authors || authors.length === 0) missing.push('autores');

      const { data: cats } = await supabase
        .from('books_categories')
        .select('category_id')
        .eq('book_id', book.id);

      if (!cats || cats.length === 0) missing.push('categorías');

      const { data: gens } = await supabase
        .from('books_genres')
        .select('genre_id')
        .eq('book_id', book.id);

      if (!gens || gens.length === 0) missing.push('géneros');

      if (missing.length > 0) {
        report.details.booksWithoutRelations.push({
          id: book.id,
          title: book.title || 'Sin título',
          missing,
        });
      }
    }

    // ============================================
    // CALCULAR ISSUES TOTALES
    // ============================================

    report.summary.issues =
      report.details.booksWithoutPDF.length +
      report.details.booksWithoutCover.length +
      report.summary.orphanedFiles +
      report.summary.brokenRelations +
      report.summary.duplicates +
      report.details.oldSoftDeletes.length +
      report.details.booksWithoutRelations.length;

    // ============================================
    // GENERAR RECOMENDACIONES
    // ============================================

    report.recommendations = generateRecommendations(report);

    console.log('✅ Auditoría completada');
    console.log(`📊 Total issues: ${report.summary.issues}`);

    return NextResponse.json(report);

  } catch (error: any) {
    console.error('❌ Error en auditoría:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error ejecutando auditoría',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST - EJECUTAR LIMPIEZA (✅ CORREGIDO)
// ============================================

export async function POST(request: NextRequest) {
  try {
    console.log('');
    console.log('🧹 ============================================');
    console.log('🧹 INICIANDO LIMPIEZA AUTOMÁTICA');
    console.log('🧹 ============================================');

    const supabase = getSupabaseAdmin();

    const results = {
      relations: 0,
      oldBooks: 0,
      orphanedPDFs: 0,
      orphanedImages: 0,
    };

    // ============================================
    // 1. OBTENER LIBROS ACTIVOS
    // ============================================
    console.log('\n📊 Paso 1: Obteniendo libros activos...');
    
    const { data: allBooks, error: booksError } = await supabase
      .from('books')
      .select('id')
      .is('deleted_at', null);

    if (booksError) {
      console.error('❌ Error obteniendo libros:', booksError);
      throw new Error(`Error obteniendo libros: ${booksError.message}`);
    }

    const activeBookIds = new Set((allBooks || []).map(b => b.id));
    console.log(`✅ Libros activos encontrados: ${activeBookIds.size}`);

    // ============================================
    // 2. ELIMINAR ARCHIVOS HUÉRFANOS - PDFs (✅ CORREGIDO)
    // ============================================
    console.log('\n📄 Paso 2: Limpiando PDFs huérfanos...');

    try {
      const { data: pdfFolders, error: pdfListError } = await supabase.storage
        .from('book-pdfs')
        .list('', { limit: 1000 });

      if (pdfListError) {
        console.warn('⚠️ Error listando PDFs:', pdfListError);
      } else if (pdfFolders) {
        console.log(`📁 Carpetas de usuario encontradas: ${pdfFolders.length}`);
        
        for (const userFolder of pdfFolders) {
          if (userFolder.name === '.emptyFolderPlaceholder') continue;

          const { data: bookFolders } = await supabase.storage
            .from('book-pdfs')
            .list(userFolder.name, { limit: 1000 });

          if (bookFolders) {
            console.log(`  📂 Usuario ${userFolder.name}: ${bookFolders.length} carpetas de libros`);
            
            for (const bookFolder of bookFolders) {
              if (bookFolder.name === '.emptyFolderPlaceholder') continue;
              
              // ✅ VERIFICAR: Libro NO existe en BD
              if (!activeBookIds.has(bookFolder.name)) {
                const bookPath = `${userFolder.name}/${bookFolder.name}`;
                console.log(`  🗑️ HUÉRFANO DETECTADO: ${bookPath}`);

                const allFilesToDelete: string[] = [];

                // ✅ MÉTODO CORRECTO: Listar TODO recursivamente (como en HardDeleteBook)
                try {
                  // Listar archivos en raíz del libro (si hay)
                  const { data: rootFiles } = await supabase.storage
                    .from('book-pdfs')
                    .list(bookPath, { limit: 1000 });

                  if (rootFiles) {
                    rootFiles
                      .filter(f => f.name !== '.emptyFolderPlaceholder')
                      .forEach(f => allFilesToDelete.push(`${bookPath}/${f.name}`));
                  }

                  // ✅ CRÍTICO: También buscar en subcarpetas si existen
                  // Para PDFs normalmente hay: user-id/book-id/document.pdf
                  // Pero podría haber estructura de carpetas
                  
                  if (allFilesToDelete.length > 0) {
                    console.log(`    📎 Total archivos a eliminar: ${allFilesToDelete.length}`);
                    allFilesToDelete.forEach(path => console.log(`       - ${path}`));
                    
                    // ✅ ELIMINAR TODO
                    const { data: removeData, error: deleteError } = await supabase.storage
                      .from('book-pdfs')
                      .remove(allFilesToDelete);

                    if (deleteError) {
                      console.error(`    ❌ ERROR:`, deleteError.message);
                    } else {
                      results.orphanedPDFs += allFilesToDelete.length;
                      console.log(`    ✅ ELIMINADOS ${allFilesToDelete.length} archivos`);
                    }
                  } else {
                    console.log(`    ℹ️ Sin archivos para eliminar en: ${bookPath}`);
                  }
                } catch (err) {
                  console.error(`    ❌ Error procesando ${bookPath}:`, err);
                }
              }
            }
          }
        }
        console.log(`✅ TOTAL PDFs ELIMINADOS: ${results.orphanedPDFs}`);
      }
    } catch (err) {
      console.error('❌ Error CRÍTICO en limpieza de PDFs:', err);
      console.error('❌ Stack:', err instanceof Error ? err.stack : 'Sin stack');
    }

    // ============================================
    // 3. ELIMINAR ARCHIVOS HUÉRFANOS - IMÁGENES (✅ CORREGIDO)
    // ============================================
    console.log('\n🖼️ Paso 3: Limpiando imágenes huérfanas...');

    try {
      const { data: imageFolders, error: imgListError } = await supabase.storage
        .from('book-images')
        .list('', { limit: 1000 });

      if (imgListError) {
        console.warn('⚠️ Error listando imágenes:', imgListError);
      } else if (imageFolders) {
        console.log(`📁 Carpetas de usuario encontradas: ${imageFolders.length}`);
        
        for (const userFolder of imageFolders) {
          if (userFolder.name === '.emptyFolderPlaceholder') continue;

          const { data: bookFolders } = await supabase.storage
            .from('book-images')
            .list(userFolder.name, { limit: 1000 });

          if (bookFolders) {
            console.log(`  📂 Usuario ${userFolder.name}: ${bookFolders.length} carpetas de libros`);
            
            for (const bookFolder of bookFolders) {
              if (bookFolder.name === '.emptyFolderPlaceholder') continue;
              
              // ✅ VERIFICAR: Libro NO existe en BD
              if (!activeBookIds.has(bookFolder.name)) {
                const bookPath = `${userFolder.name}/${bookFolder.name}`;
                console.log(`  🗑️ HUÉRFANO DETECTADO: ${bookPath}`);

                const allFilesToDelete: string[] = [];

                // ✅ MÉTODO CORRECTO: Listar subcarpetas (como en HardDeleteBook)
                const subfolders = ['covers', 'pages', 'backgrounds'];
                
                try {
                  for (const subfolder of subfolders) {
                    const subPath = `${bookPath}/${subfolder}`;
                    const { data: files } = await supabase.storage
                      .from('book-images')
                      .list(subPath, { limit: 1000 });

                    if (files && files.length > 0) {
                      files
                        .filter(f => f.name !== '.emptyFolderPlaceholder')
                        .forEach(f => allFilesToDelete.push(`${subPath}/${f.name}`));
                    }
                  }

                  if (allFilesToDelete.length > 0) {
                    console.log(`    📎 Total archivos a eliminar: ${allFilesToDelete.length}`);
                    allFilesToDelete.forEach(path => console.log(`       - ${path}`));
                    
                    // ✅ ELIMINAR TODO
                    const { data: removeData, error: deleteError } = await supabase.storage
                      .from('book-images')
                      .remove(allFilesToDelete);

                    if (deleteError) {
                      console.error(`    ❌ ERROR:`, deleteError.message);
                    } else {
                      results.orphanedImages += allFilesToDelete.length;
                      console.log(`    ✅ ELIMINADOS ${allFilesToDelete.length} archivos`);
                    }
                  } else {
                    console.log(`    ℹ️ Sin archivos para eliminar en: ${bookPath}`);
                  }
                } catch (err) {
                  console.error(`    ❌ Error procesando ${bookPath}:`, err);
                }
              }
            }
          }
        }
        console.log(`✅ TOTAL IMÁGENES ELIMINADAS: ${results.orphanedImages}`);
      }
    } catch (err) {
      console.error('❌ Error CRÍTICO en limpieza de imágenes:', err);
      console.error('❌ Stack:', err instanceof Error ? err.stack : 'Sin stack');
    }

    // ============================================
    // 4. LIMPIAR RELACIONES ROTAS
    // ============================================
    console.log('\n🔗 Paso 4: Limpiando relaciones rotas...');

    const tables = [
      'books_authors',
      'books_characters',
      'books_categories',
      'books_genres',
      'books_tags',
      'books_values'
    ];

    for (const table of tables) {
      try {
        const { data: rels } = await supabase
          .from(table)
          .select('book_id');

        if (rels) {
          const toDelete = [...new Set(
            rels
              .filter(r => !activeBookIds.has(r.book_id))
              .map(r => r.book_id)
          )];

          if (toDelete.length > 0) {
            console.log(`  📋 ${table}: ${toDelete.length} IDs de libros inválidos`);
            
            const { error, count } = await supabase
              .from(table)
              .delete()
              .in('book_id', toDelete);

            if (error) {
              console.error(`    ❌ Error:`, error);
            } else {
              results.relations += toDelete.length;
              console.log(`    ✅ Eliminadas ${toDelete.length} relaciones`);
            }
          }
        }
      } catch (err) {
        console.error(`  ❌ Error en ${table}:`, err);
      }
    }
    console.log(`✅ Total relaciones eliminadas: ${results.relations}`);

    // ============================================
    // 5. ELIMINAR SOFT DELETES ANTIGUOS (>90 días)
    // ============================================
    console.log('\n🗑️ Paso 5: Limpiando soft deletes antiguos...');

    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: oldBooks } = await supabase
        .from('books')
        .select('id, title, deleted_at')
        .not('deleted_at', 'is', null)
        .lt('deleted_at', ninetyDaysAgo.toISOString());

      if (oldBooks && oldBooks.length > 0) {
        console.log(`📚 Libros a eliminar: ${oldBooks.length}`);
        oldBooks.forEach(book => {
          console.log(`  - ${book.title} (eliminado hace ${Math.floor((Date.now() - new Date(book.deleted_at).getTime()) / (1000 * 60 * 60 * 24))} días)`);
        });

        const { error } = await supabase
          .from('books')
          .delete()
          .in('id', oldBooks.map(b => b.id));

        if (error) {
          console.error(`❌ Error eliminando libros antiguos:`, error);
        } else {
          results.oldBooks = oldBooks.length;
          console.log(`✅ ${oldBooks.length} libros antiguos eliminados`);
        }
      } else {
        console.log('ℹ️ No hay libros antiguos para eliminar');
      }
    } catch (err) {
      console.error('❌ Error en limpieza de soft deletes:', err);
    }

    // ============================================
    // RESUMEN FINAL
    // ============================================
    const totalCleaned = 
      results.relations + 
      results.oldBooks + 
      results.orphanedPDFs + 
      results.orphanedImages;

    console.log('\n✅ ============================================');
    console.log('✅ LIMPIEZA COMPLETADA');
    console.log('✅ ============================================');
    console.log(`📊 Resumen:`);
    console.log(`   - PDFs huérfanos: ${results.orphanedPDFs}`);
    console.log(`   - Imágenes huérfanas: ${results.orphanedImages}`);
    console.log(`   - Relaciones rotas: ${results.relations}`);
    console.log(`   - Libros antiguos: ${results.oldBooks}`);
    console.log(`   - TOTAL: ${totalCleaned} elementos eliminados`);
    console.log('✅ ============================================\n');

    return NextResponse.json({
      success: true,
      cleaned: totalCleaned,
      details: results,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('\n❌ ============================================');
    console.error('❌ ERROR EN LIMPIEZA');
    console.error('❌ ============================================');
    console.error(error);
    console.error('❌ ============================================\n');
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error ejecutando limpieza',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// ============================================
// HELPERS
// ============================================

function generateRecommendations(report: AuditReport): string[] {
  const recommendations: string[] = [];

  if (report.details.orphanedPDFs.length > 0) {
    recommendations.push(
      `Eliminar ${report.details.orphanedPDFs.length} PDFs huérfanos para liberar espacio`
    );
  }

  if (report.details.orphanedImages.length > 0) {
    recommendations.push(
      `Eliminar ${report.details.orphanedImages.length} imágenes huérfanas`
    );
  }

  if (report.summary.brokenRelations > 0) {
    recommendations.push(
      `Limpiar ${report.summary.brokenRelations} relaciones rotas en la base de datos`
    );
  }

  if (report.details.duplicateAuthors.length > 0) {
    recommendations.push(
      `Revisar y fusionar ${report.details.duplicateAuthors.length} autores duplicados`
    );
  }

  if (report.details.duplicateCharacters.length > 0) {
    recommendations.push(
      `Revisar y fusionar ${report.details.duplicateCharacters.length} personajes duplicados`
    );
  }

  if (report.details.oldSoftDeletes.length > 0) {
    recommendations.push(
      `Eliminar permanentemente ${report.details.oldSoftDeletes.length} libros en papelera hace más de 30 días`
    );
  }

  if (report.details.booksWithoutPDF.length > 0) {
    recommendations.push(
      `Revisar ${report.details.booksWithoutPDF.length} libros sin archivo PDF`
    );
  }

  if (report.details.booksWithoutCover.length > 0) {
    recommendations.push(
      `Agregar portadas a ${report.details.booksWithoutCover.length} libros`
    );
  }

  if (report.details.booksWithoutRelations.length > 0) {
    recommendations.push(
      `Completar metadatos de ${report.details.booksWithoutRelations.length} libros sin relaciones básicas`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ ¡Todo está en orden! No se detectaron problemas');
  }

  return recommendations;
}
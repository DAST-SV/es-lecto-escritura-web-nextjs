/**
 * UBICACIÓN: scripts/audit-books-clean.ts
 * ✅ ARQUITECTURA LIMPIA: Script CLI que usa casos de uso
 */

import { AuditBooksUseCase } from '@/src/core/application/use-cases/audit/AuditBooks.usecase';
import { SupabaseAuditRepository } from '@/src/infrastructure/repositories/audit/AuditRepository';
import * as fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  console.log('🔍 Iniciando auditoría de libros...\n');

  try {
    // ✅ Instanciar repositorio (capa de infraestructura)
    const auditRepository = new SupabaseAuditRepository(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY
    );

    // ✅ Instanciar caso de uso (capa de aplicación)
    const auditUseCase = new AuditBooksUseCase(auditRepository);

    // ✅ Ejecutar auditoría
    const report = await auditUseCase.execute();

    // Mostrar resumen
    console.log('='.repeat(60));
    console.log('📊 RESUMEN DE AUDITORÍA');
    console.log('='.repeat(60));
    console.log(`📚 Libros totales: ${report.summary.totalBooks}`);
    console.log(`✅ Libros activos: ${report.summary.activeBooks}`);
    console.log(`🗑️  Libros eliminados: ${report.summary.deletedBooks}`);
    console.log(`📦 Archivos huérfanos: ${report.summary.orphanedFiles}`);
    console.log(`🔗 Relaciones rotas: ${report.summary.brokenRelations}`);
    console.log(`🔄 Duplicados: ${report.summary.duplicates}`);
    console.log(`⚠️  TOTAL DE ISSUES: ${report.summary.issues}`);
    console.log('='.repeat(60));

    // Mostrar recomendaciones
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMENDACIONES:');
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    // Guardar reporte
    const reportPath = `./audit-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Reporte guardado en: ${reportPath}`);

  } catch (error) {
    console.error('❌ Error ejecutando auditoría:', error);
    process.exit(1);
  }
}

main();
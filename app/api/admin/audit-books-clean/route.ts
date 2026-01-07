/**
 * UBICACIÓN: app/api/admin/audit-books-clean/route.ts
 * ✅ ARQUITECTURA LIMPIA: API route que usa casos de uso
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditBooksUseCase } from '@/src/core/application/use-cases/audit/AuditBooks.usecase';
import { SupabaseAuditRepository } from '@/src/infrastructure/repositories/audit/AuditRepository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación (simplificado)
    // Aquí deberías verificar permisos de admin

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // ✅ Instanciar repositorio
    const auditRepository = new SupabaseAuditRepository(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY
    );

    // ✅ Instanciar caso de uso
    const auditUseCase = new AuditBooksUseCase(auditRepository);

    // ✅ Ejecutar auditoría
    const report = await auditUseCase.execute();

    return NextResponse.json({
      success: true,
      summary: report.summary,
      details: report.details,
      recommendations: report.recommendations,
      timestamp: report.timestamp,
    });

  } catch (error: any) {
    console.error('Error en auditoría:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
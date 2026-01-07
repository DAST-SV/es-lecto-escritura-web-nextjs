/**
 * UBICACIÓN: app/api/cron/audit-books/route.ts
 * ⏰ CRON: Auditoría automática diaria
 * 
 * Configurar en Vercel:
 * - Path: /api/cron/audit-books
 * - Schedule: 0 2 * * * (2am diario)
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditBooksUseCase } from '@/src/core/application/use-cases/audit/AuditBooks.usecase';
import { SupabaseAuditRepository } from '@/src/infrastructure/repositories/audit/AuditRepository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // ✅ Verificar que viene de Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏰ Ejecutando auditoría automática...');

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // ✅ Ejecutar auditoría
    const auditRepository = new SupabaseAuditRepository(
      SUPABASE_URL,
      SUPABASE_SERVICE_KEY
    );
    const auditUseCase = new AuditBooksUseCase(auditRepository);
    const report = await auditUseCase.execute();

    // ✅ Si hay muchos issues, enviar alerta
    if (report.summary.issues > 50) {
      await sendSlackAlert(report);
      await sendEmailAlert(report);
    }

    // ✅ Guardar reporte en BD para historial
    await saveReportToDatabase(report);

    console.log('✅ Auditoría automática completada');
    console.log(`Issues encontrados: ${report.summary.issues}`);

    return NextResponse.json({
      success: true,
      timestamp: report.timestamp,
      issues: report.summary.issues,
      message: `Auditoría completada. ${report.summary.issues} issues encontrados.`,
    });

  } catch (error: any) {
    console.error('❌ Error en auditoría automática:', error);
    await sendErrorAlert(error);
    
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// ========================================
// Funciones auxiliares
// ========================================

async function sendSlackAlert(report: any) {
  // Enviar alerta a Slack
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Auditoría: ${report.summary.issues} issues encontrados`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Auditoría de Libros*\n${report.summary.issues} problemas detectados`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Archivos huérfanos:*\n${report.summary.orphanedFiles}` },
            { type: 'mrkdwn', text: `*Relaciones rotas:*\n${report.summary.brokenRelations}` },
          ],
        },
      ],
    }),
  });
}

async function sendEmailAlert(report: any) {
  // Enviar email con Resend/SendGrid/etc
  // ...
}

async function saveReportToDatabase(report: any) {
  // Guardar en tabla audit_reports para historial
  // ...
}

async function sendErrorAlert(error: Error) {
  // Enviar alerta de error
  // ...
}
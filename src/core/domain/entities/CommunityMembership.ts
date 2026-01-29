/**
 * ============================================
 * ENTIDAD: CommunityMembership
 * Membresía de un usuario a una comunidad de autor
 * ============================================
 */

import { MembershipStatus, CommunityMembershipData } from '../types';

export class CommunityMembership {
  constructor(
    public readonly id: string,
    public readonly communityId: string,
    public readonly userId: string,
    public readonly planId: string,
    public readonly status: MembershipStatus,
    public readonly startedAt: Date,
    public readonly expiresAt: Date | null,
    public readonly cancelledAt: Date | null,
    public readonly pausedAt: Date | null,
    public readonly stripeSubscriptionId: string | null,
    public readonly stripeCustomerId: string | null,
    public readonly lastPaymentAt: Date | null,
    public readonly nextPaymentAt: Date | null,
    public readonly totalPaid: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Crea una instancia desde datos de base de datos
   */
  static fromDatabase(data: Record<string, unknown>): CommunityMembership {
    return new CommunityMembership(
      data.id as string,
      data.community_id as string,
      data.user_id as string,
      data.plan_id as string,
      (data.status as MembershipStatus) || 'pending',
      new Date(data.started_at as string),
      data.expires_at ? new Date(data.expires_at as string) : null,
      data.cancelled_at ? new Date(data.cancelled_at as string) : null,
      data.paused_at ? new Date(data.paused_at as string) : null,
      (data.stripe_subscription_id as string) || null,
      (data.stripe_customer_id as string) || null,
      data.last_payment_at ? new Date(data.last_payment_at as string) : null,
      data.next_payment_at ? new Date(data.next_payment_at as string) : null,
      parseFloat(String(data.total_paid ?? 0)),
      new Date(data.created_at as string),
      new Date(data.updated_at as string)
    );
  }

  /**
   * Convierte a objeto plano para UI
   */
  toData(): CommunityMembershipData {
    return {
      id: this.id,
      communityId: this.communityId,
      userId: this.userId,
      planId: this.planId,
      status: this.status,
      startedAt: this.startedAt,
      expiresAt: this.expiresAt ?? undefined,
      cancelledAt: this.cancelledAt ?? undefined,
    };
  }

  /**
   * Valida la entidad
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.communityId) {
      errors.push('El ID de la comunidad es requerido');
    }

    if (!this.userId) {
      errors.push('El ID del usuario es requerido');
    }

    if (!this.planId) {
      errors.push('El ID del plan es requerido');
    }

    const validStatuses: MembershipStatus[] = ['active', 'cancelled', 'expired', 'pending', 'paused'];
    if (!validStatuses.includes(this.status)) {
      errors.push('El estado no es válido');
    }

    return errors;
  }

  /**
   * Verifica si es válida
   */
  isValid(): boolean {
    return this.validate().length === 0;
  }

  /**
   * Verifica si la membresía está activa
   */
  isActive(): boolean {
    if (this.status !== 'active') return false;
    if (this.expiresAt && this.expiresAt < new Date()) return false;
    return true;
  }

  /**
   * Verifica si la membresía está cancelada
   */
  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  /**
   * Verifica si la membresía está expirada
   */
  isExpired(): boolean {
    return this.status === 'expired' ||
           (this.expiresAt !== null && this.expiresAt < new Date());
  }

  /**
   * Verifica si la membresía está pausada
   */
  isPaused(): boolean {
    return this.status === 'paused';
  }

  /**
   * Verifica si la membresía está pendiente
   */
  isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Obtiene los días restantes de la membresía
   */
  getDaysRemaining(): number | null {
    if (!this.expiresAt) return null;
    const now = new Date();
    const diff = this.expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene la etiqueta del estado en español
   */
  getStatusLabel(): string {
    const labels: Record<MembershipStatus, string> = {
      active: 'Activa',
      cancelled: 'Cancelada',
      expired: 'Expirada',
      pending: 'Pendiente',
      paused: 'Pausada',
    };
    return labels[this.status] || this.status;
  }
}

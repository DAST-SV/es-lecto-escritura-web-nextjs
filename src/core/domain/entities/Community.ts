/**
 * ============================================
 * ENTIDAD: Community
 * Comunidad de pago de un autor (estilo Patreon)
 * ============================================
 */

import { CommunityData, CommunityPlanData, BillingPeriod } from '../types';

export class CommunityPlan {
  constructor(
    public readonly id: string,
    public readonly communityId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly price: number,
    public readonly currency: string,
    public readonly billingPeriod: BillingPeriod,
    public readonly benefits: string[],
    public readonly maxMembers: number | null,
    public readonly isActive: boolean,
    public readonly isFeatured: boolean,
    public readonly displayOrder: number,
    public readonly stripePriceId: string | null,
    public readonly createdAt: Date
  ) {}

  static fromDatabase(data: Record<string, unknown>): CommunityPlan {
    return new CommunityPlan(
      data.id as string,
      data.community_id as string,
      data.name as string,
      (data.description as string) || null,
      parseFloat(String(data.price)),
      (data.currency as string) || 'USD',
      (data.billing_period as BillingPeriod) || 'monthly',
      (data.benefits as string[]) || [],
      (data.max_members as number) || null,
      (data.is_active as boolean) ?? true,
      (data.is_featured as boolean) ?? false,
      (data.display_order as number) ?? 1,
      (data.stripe_price_id as string) || null,
      new Date(data.created_at as string)
    );
  }

  toData(): CommunityPlanData {
    return {
      id: this.id,
      communityId: this.communityId,
      name: this.name,
      description: this.description ?? undefined,
      price: this.price,
      currency: this.currency,
      billingPeriod: this.billingPeriod,
      benefits: this.benefits,
      isActive: this.isActive,
      isFeatured: this.isFeatured,
      displayOrder: this.displayOrder,
    };
  }

  /**
   * Formatea el precio para mostrar
   */
  getFormattedPrice(): string {
    const formatter = new Intl.NumberFormat('es', {
      style: 'currency',
      currency: this.currency,
    });
    return formatter.format(this.price);
  }

  /**
   * Obtiene el texto del período de facturación
   */
  getBillingPeriodLabel(): string {
    const labels: Record<BillingPeriod, string> = {
      monthly: '/mes',
      quarterly: '/trimestre',
      yearly: '/año',
      lifetime: 'único',
    };
    return labels[this.billingPeriod] || '';
  }
}

export class Community {
  constructor(
    public readonly id: string,
    public readonly authorId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly shortDescription: string | null,
    public readonly slug: string,
    public readonly coverUrl: string | null,
    public readonly welcomeMessage: string | null,
    public readonly isActive: boolean,
    public readonly requiresApproval: boolean,
    public readonly totalMembers: number,
    public readonly totalRevenue: number,
    public readonly stripeProductId: string | null,
    public readonly plans: CommunityPlan[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Crea una instancia desde datos de base de datos
   */
  static fromDatabase(
    data: Record<string, unknown>,
    plansData: Record<string, unknown>[] = []
  ): Community {
    const plans = plansData.map(p => CommunityPlan.fromDatabase(p));

    return new Community(
      data.id as string,
      data.author_id as string,
      data.name as string,
      (data.description as string) || null,
      (data.short_description as string) || null,
      data.slug as string,
      (data.cover_url as string) || null,
      (data.welcome_message as string) || null,
      (data.is_active as boolean) ?? true,
      (data.requires_approval as boolean) ?? false,
      (data.total_members as number) ?? 0,
      parseFloat(String(data.total_revenue ?? 0)),
      (data.stripe_product_id as string) || null,
      plans,
      new Date(data.created_at as string),
      new Date(data.updated_at as string)
    );
  }

  /**
   * Convierte a objeto plano para UI
   */
  toData(): CommunityData {
    return {
      id: this.id,
      authorId: this.authorId,
      name: this.name,
      description: this.description ?? undefined,
      shortDescription: this.shortDescription ?? undefined,
      slug: this.slug,
      coverUrl: this.coverUrl ?? undefined,
      welcomeMessage: this.welcomeMessage ?? undefined,
      isActive: this.isActive,
      requiresApproval: this.requiresApproval,
      totalMembers: this.totalMembers,
      plans: this.plans.map(p => p.toData()),
      createdAt: this.createdAt,
    };
  }

  /**
   * Valida la entidad
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.authorId) {
      errors.push('El ID del autor es requerido');
    }

    if (!this.name || this.name.trim().length === 0) {
      errors.push('El nombre de la comunidad es requerido');
    }

    if (this.name && this.name.length > 200) {
      errors.push('El nombre no puede exceder 200 caracteres');
    }

    if (!this.slug || this.slug.trim().length === 0) {
      errors.push('El slug es requerido');
    }

    if (this.slug && !/^[a-z0-9-]+$/.test(this.slug)) {
      errors.push('El slug solo puede contener letras minúsculas, números y guiones');
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
   * URL de la comunidad
   */
  getCommunityUrl(locale: string = 'es'): string {
    return `/${locale}/community/${this.slug}`;
  }

  /**
   * Obtiene el plan más barato
   */
  getCheapestPlan(): CommunityPlan | null {
    const activePlans = this.plans.filter(p => p.isActive);
    if (activePlans.length === 0) return null;

    return activePlans.reduce((cheapest, plan) =>
      plan.price < cheapest.price ? plan : cheapest
    );
  }

  /**
   * Obtiene el plan destacado
   */
  getFeaturedPlan(): CommunityPlan | null {
    return this.plans.find(p => p.isFeatured && p.isActive) || null;
  }

  /**
   * Obtiene planes activos ordenados
   */
  getActivePlans(): CommunityPlan[] {
    return this.plans
      .filter(p => p.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }
}

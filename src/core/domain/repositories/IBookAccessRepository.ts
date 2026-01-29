/**
 * ============================================
 * INTERFAZ: IBookAccessRepository
 * Repositorio para control de acceso a libros
 * ============================================
 */

import { AccessType, UserAccessLevel, BookAccessConfig, SubscriptionPlan } from '../types';

export interface IBookAccessRepository {
  // Configuración de acceso del libro
  getBookAccessConfig(bookId: string): Promise<BookAccessConfig>;
  setBookAccessType(bookId: string, accessType: AccessType): Promise<void>;
  setFreePageCount(bookId: string, count: number): Promise<void>;
  setPageAccessLevel(bookId: string, pageNumber: number, accessLevel: AccessType): Promise<void>;
  setPageAccessLevelsBulk(bookId: string, pageAccessLevels: Record<number, AccessType>): Promise<void>;
  resetPageAccessLevels(bookId: string): Promise<void>;

  // Verificación de acceso
  canUserAccessBook(userId: string | null, bookId: string): Promise<boolean>;
  canUserAccessPage(userId: string | null, bookId: string, pageNumber: number): Promise<boolean>;
  getAccessiblePagesForUser(userId: string | null, bookId: string): Promise<number[]>;
  getLockedPagesForUser(userId: string | null, bookId: string): Promise<number[]>;

  // Nivel de acceso del usuario
  getUserAccessLevel(userId: string): Promise<UserAccessLevel>;
  hasActiveSubscription(userId: string): Promise<boolean>;
  getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlan>;
  isUserCommunityMember(userId: string, authorId: string): Promise<boolean>;
  getUserCommunityMemberships(userId: string): Promise<string[]>;

  // Suscripciones de plataforma
  createSubscription(userId: string, plan: SubscriptionPlan): Promise<void>;
  updateSubscription(userId: string, plan: SubscriptionPlan): Promise<void>;
  cancelSubscription(userId: string): Promise<void>;
  getSubscriptionExpiry(userId: string): Promise<Date | null>;

  // Consultas de libros por acceso
  getPublicBooks(limit?: number, offset?: number): Promise<string[]>;
  getFreemiumBooks(limit?: number, offset?: number): Promise<string[]>;
  getPremiumBooks(limit?: number, offset?: number): Promise<string[]>;
  getCommunityBooks(authorId: string, limit?: number, offset?: number): Promise<string[]>;
  getBooksAccessibleByUser(userId: string, limit?: number, offset?: number): Promise<string[]>;
}

export interface ISubscriptionPlanRepository {
  // Planes disponibles
  getAllPlans(): Promise<Array<{
    plan: SubscriptionPlan;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    currency: string;
    features: string[];
    canAccessPremium: boolean;
    canDownloadOffline: boolean;
    canCreateBooks: boolean;
    maxCreatedBooks: number;
  }>>;

  getPlanDetails(plan: SubscriptionPlan): Promise<{
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    currency: string;
    features: string[];
    canAccessPremium: boolean;
    canDownloadOffline: boolean;
    canCreateBooks: boolean;
    maxCreatedBooks: number;
  } | null>;

  // Stripe integration (preparado para futuro)
  getStripePriceId(plan: SubscriptionPlan, billingPeriod: 'monthly' | 'yearly'): Promise<string | null>;
  setStripePriceId(plan: SubscriptionPlan, billingPeriod: 'monthly' | 'yearly', priceId: string): Promise<void>;
}

// ============================================
// src/infrastructure/repositories/SupabaseRouteAccessRepository.ts
// ============================================

import { createClient } from '@/src/infrastructure/config/supabase.config';
import { RouteAccessRepository, AccessibleRoute } from '@/src/core/domain/repositories/RouteAccessRepository';

export class SupabaseRouteAccessRepository implements RouteAccessRepository {
  private supabase = createClient();

  async canAccessRoute(userId: string | null, pathname: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('can_access_route', {
      p_user_id: userId,
      p_pathname: pathname,
    });

    if (error) {
      console.error('Error checking route access:', error);
      return false;
    }

    return data === true;
  }

  async getAccessibleRoutes(userId: string | null, languageCode: string): Promise<AccessibleRoute[]> {
    const { data, error } = await this.supabase.rpc('get_accessible_routes', {
      p_user_id: userId,
      p_language_code: languageCode,
    });

    if (error) {
      console.error('Error getting accessible routes:', error);
      return [];
    }

    return (data || []).map((r: any) => ({
      routeId: r.route_id,
      pathname: r.pathname,
      translatedPath: r.translated_path,
      displayName: r.display_name,
    }));
  }
}
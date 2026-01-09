// ============================================
// src/infrastructure/repositories/SupabaseAuthRepository.ts
// ============================================

import { IAuthRepository } from '@/src/core/domain/repositories/IAuthRepository';
import { User } from '@/src/core/domain/entities/User';
import { createClient } from '@/src/utils/supabase/client';

export class SupabaseAuthRepository implements IAuthRepository {
  private supabase = createClient();

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    if (!data.user) return null;

    return new User(
      data.user.id,
      data.user.email!,
      data.user.user_metadata
    );
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: listener } = this.supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          callback(
            new User(
              session.user.id,
              session.user.email!,
              session.user.user_metadata
            )
          );
        } else {
          callback(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }
}
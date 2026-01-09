// ============================================
// 13. src/core/domain/types/Auth.types.ts
// ============================================
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  error?: string;
  success?: boolean;
  email?: string;
}

export type OAuthProvider = "google" | "apple" | "azure" | "facebook" | "twitter" | "spotify";
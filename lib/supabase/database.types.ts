// lib/supabase/database.types.ts

/**
 * Supabase Database Types
 * Tipos generados automáticamente desde la base de datos
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type LanguageCode = 'es' | 'en' | 'fr' | 'it';
export type PermissionType = 'grant' | 'deny';

export interface Database {
  app: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          hierarchy_level: number;
          is_active: boolean;
          is_system_role: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          hierarchy_level?: number;
          is_active?: boolean;
          is_system_role?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          hierarchy_level?: number;
          is_active?: boolean;
          is_system_role?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      routes: {
        Row: {
          id: string;
          pathname: string;
          display_name: string;
          description: string | null;
          icon: string | null;
          show_in_menu: boolean;
          menu_order: number;
          parent_route_id: string | null;
          is_active: boolean;
          is_public: boolean;
          requires_verification: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          pathname: string;
          display_name: string;
          description?: string | null;
          icon?: string | null;
          show_in_menu?: boolean;
          menu_order?: number;
          parent_route_id?: string | null;
          is_active?: boolean;
          is_public?: boolean;
          requires_verification?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          pathname?: string;
          display_name?: string;
          description?: string | null;
          icon?: string | null;
          show_in_menu?: boolean;
          menu_order?: number;
          parent_route_id?: string | null;
          is_active?: boolean;
          is_public?: boolean;
          requires_verification?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          created_by?: string | null;
        };
      };
      route_translations: {
        Row: {
          id: string;
          route_id: string;
          language_code: LanguageCode;
          translated_path: string;
          translated_name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          route_id: string;
          language_code: LanguageCode;
          translated_path: string;
          translated_name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          route_id?: string;
          language_code?: LanguageCode;
          translated_path?: string;
          translated_name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          revoked_at: string | null;
          assigned_by: string | null;
          revoked_by: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          revoked_at?: string | null;
          assigned_by?: string | null;
          revoked_by?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          revoked_at?: string | null;
          assigned_by?: string | null;
          revoked_by?: string | null;
          notes?: string | null;
        };
      };
      route_permissions: {
        Row: {
          id: string;
          role_name: string;
          route_id: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          role_name: string;
          route_id: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          role_name?: string;
          route_id?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      user_route_permissions: {
        Row: {
          id: string;
          user_id: string;
          route_id: string;
          permission_type: PermissionType;
          reason: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          granted_by: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          route_id: string;
          permission_type: PermissionType;
          reason?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          granted_by?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          route_id?: string;
          permission_type?: PermissionType;
          reason?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          granted_by?: string | null;
          expires_at?: string | null;
        };
      };
      role_language_access: {
        Row: {
          id: string;
          role_name: string;
          language_code: LanguageCode;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          role_name: string;
          language_code: LanguageCode;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          role_name?: string;
          language_code?: LanguageCode;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
    };
    Functions: {
      can_access_route: {
        Args: {
          p_user_id: string;
          p_pathname: string;
          p_language_code?: LanguageCode;
        };
        Returns: boolean;
      };
      search_users_by_email: {
        Args: {
          search_email: string;
        };
        Returns: {
          user_id: string;
          email: string;
          full_name: string;
          avatar_url: string;
          provider: string;
          created_at: string;
        }[];
      };
    };
  };
}
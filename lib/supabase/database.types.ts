export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AdminRole = "admin" | "editor";

export type CategoryRow = {
  id: string;
  label: string;
  icon_url: string;
  icon_path: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type BrandRow = {
  id: string;
  name: string;
  category_id: string;
  logo_url: string;
  logo_path: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminUserRow = {
  user_id: string;
  email: string;
  role: AdminRole;
  created_at: string;
};

export type SiteContentRow = {
  id: "draft" | "published";
  content: Json;
  updated_by: string | null;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: { id: string; label: string; icon_url: string; icon_path?: string | null; sort_order?: number; is_active?: boolean };
        Update: { id?: string; label?: string; icon_url?: string; icon_path?: string | null; sort_order?: number; is_active?: boolean };
        Relationships: [];
      };
      brands: {
        Row: BrandRow;
        Insert: {
          id?: string;
          name: string;
          category_id: string;
          logo_url: string;
          logo_path?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          category_id?: string;
          logo_url?: string;
          logo_path?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "brands_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_users: {
        Row: AdminUserRow;
        Insert: { user_id: string; email: string; role?: AdminRole };
        Update: { email?: string; role?: AdminRole };
        Relationships: [];
      };
      site_content: {
        Row: SiteContentRow;
        Insert: { id: "draft" | "published"; content: Json; updated_by?: string | null; updated_at?: string };
        Update: { content?: Json; updated_by?: string | null; updated_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { admin_role: AdminRole };
    CompositeTypes: { [_ in never]: never };
  };
};

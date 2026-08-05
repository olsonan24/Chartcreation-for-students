export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          reason: string
          role: Database["public"]["Enums"]["owner_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          reason?: string
          role: Database["public"]["Enums"]["owner_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          reason?: string
          role?: Database["public"]["Enums"]["owner_role"]
          user_id?: string
        }
        Relationships: []
      }
      entitlement_history: {
        Row: {
          action: string
          capability: Database["public"]["Enums"]["entitlement_capability"]
          entitlement_id: string
          expires_at: string | null
          id: number
          is_permanent: boolean | null
          metadata: Json
          new_status: Database["public"]["Enums"]["entitlement_status"] | null
          old_status: Database["public"]["Enums"]["entitlement_status"] | null
          performed_at: string
          performed_by: string
          reason: string
          user_id: string
        }
        Insert: {
          action: string
          capability: Database["public"]["Enums"]["entitlement_capability"]
          entitlement_id: string
          expires_at?: string | null
          id?: number
          is_permanent?: boolean | null
          metadata?: Json
          new_status?: Database["public"]["Enums"]["entitlement_status"] | null
          old_status?: Database["public"]["Enums"]["entitlement_status"] | null
          performed_at?: string
          performed_by: string
          reason?: string
          user_id: string
        }
        Update: {
          action?: string
          capability?: Database["public"]["Enums"]["entitlement_capability"]
          entitlement_id?: string
          expires_at?: string | null
          id?: number
          is_permanent?: boolean | null
          metadata?: Json
          new_status?: Database["public"]["Enums"]["entitlement_status"] | null
          old_status?: Database["public"]["Enums"]["entitlement_status"] | null
          performed_at?: string
          performed_by?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlement_history_entitlement_id_fkey"
            columns: ["entitlement_id"]
            isOneToOne: false
            referencedRelation: "entitlements"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          capability: Database["public"]["Enums"]["entitlement_capability"]
          expires_at: string | null
          granted_at: string
          granted_by: string
          id: string
          is_permanent: boolean
          reason: string
          revoke_reason: string
          revoked_at: string | null
          revoked_by: string | null
          status: Database["public"]["Enums"]["entitlement_status"]
          user_id: string
        }
        Insert: {
          capability: Database["public"]["Enums"]["entitlement_capability"]
          expires_at?: string | null
          granted_at?: string
          granted_by: string
          id?: string
          is_permanent?: boolean
          reason?: string
          revoke_reason?: string
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["entitlement_status"]
          user_id: string
        }
        Update: {
          capability?: Database["public"]["Enums"]["entitlement_capability"]
          expires_at?: string | null
          granted_at?: string
          granted_by?: string
          id?: string
          is_permanent?: boolean
          reason?: string
          revoke_reason?: string
          revoked_at?: string | null
          revoked_by?: string | null
          status?: Database["public"]["Enums"]["entitlement_status"]
          user_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          called_name: string
          created_at: string
          date_of_birth: string
          full_name: string
          id: string
          name_alphabet_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          called_name?: string
          created_at?: string
          date_of_birth: string
          full_name: string
          id?: string
          name_alphabet_mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          called_name?: string
          created_at?: string
          date_of_birth?: string
          full_name?: string
          id?: string
          name_alphabet_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_entitlement: {
        Args: {
          p_capability: Database["public"]["Enums"]["entitlement_capability"]
          p_user_id: string
        }
        Returns: boolean
      }
      is_owner_or_admin: { Args: { p_user_id: string }; Returns: boolean }
    }
    Enums: {
      entitlement_capability:
        | "chart_access"
        | "timeline_access"
        | "timeline_descriptions"
        | "comparisons"
        | "print_export"
        | "advanced_insights"
      entitlement_status: "active" | "revoked" | "suspended" | "expired"
      owner_role: "owner" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      entitlement_capability: [
        "chart_access",
        "timeline_access",
        "timeline_descriptions",
        "comparisons",
        "print_export",
        "advanced_insights",
      ],
      entitlement_status: ["active", "revoked", "suspended", "expired"],
      owner_role: ["owner", "admin"],
    },
  },
} as const

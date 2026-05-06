export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      deadlines: {
        Row: {
          amount: number | null
          amount_is_estimated: boolean
          assigned_to_member_id: string | null
          created_at: string
          currency: string
          due_date: string
          family_id: string | null
          id: string
          is_recurring: boolean
          notes: string | null
          owner_user_id: string | null
          payment_method_id: string | null
          person_id: string | null
          pet_id: string | null
          recurrence_months: number | null
          reminder_days_before: number
          status: Database["public"]["Enums"]["deadline_status"]
          title: string | null
          type: Database["public"]["Enums"]["deadline_type"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          amount?: number | null
          amount_is_estimated?: boolean
          assigned_to_member_id?: string | null
          created_at?: string
          currency?: string
          due_date: string
          family_id?: string | null
          id?: string
          is_recurring?: boolean
          notes?: string | null
          owner_user_id?: string | null
          payment_method_id?: string | null
          person_id?: string | null
          pet_id?: string | null
          recurrence_months?: number | null
          reminder_days_before?: number
          status?: Database["public"]["Enums"]["deadline_status"]
          title?: string | null
          type: Database["public"]["Enums"]["deadline_type"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          amount?: number | null
          amount_is_estimated?: boolean
          assigned_to_member_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string
          family_id?: string | null
          id?: string
          is_recurring?: boolean
          notes?: string | null
          owner_user_id?: string | null
          payment_method_id?: string | null
          person_id?: string | null
          pet_id?: string | null
          recurrence_months?: number | null
          reminder_days_before?: number
          status?: Database["public"]["Enums"]["deadline_status"]
          title?: string | null
          type?: Database["public"]["Enums"]["deadline_type"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_assigned_to_member_id_fkey"
            columns: ["assigned_to_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deadlines_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          display_name: string
          family_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          display_name: string
          family_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          display_name?: string
          family_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      home_maintenance: {
        Row: {
          category: Database["public"]["Enums"]["maintenance_category"]
          created_at: string
          current_km: number | null
          family_id: string | null
          id: string
          interval_type: Database["public"]["Enums"]["maintenance_interval_type"]
          interval_value: number | null
          last_done_date: string | null
          next_due_date: string | null
          notes: string | null
          owner_user_id: string | null
          pet_id: string | null
          reminder_days_before: number
          status: Database["public"]["Enums"]["maintenance_status"]
          title: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["maintenance_category"]
          created_at?: string
          current_km?: number | null
          family_id?: string | null
          id?: string
          interval_type?: Database["public"]["Enums"]["maintenance_interval_type"]
          interval_value?: number | null
          last_done_date?: string | null
          next_due_date?: string | null
          notes?: string | null
          owner_user_id?: string | null
          pet_id?: string | null
          reminder_days_before?: number
          status?: Database["public"]["Enums"]["maintenance_status"]
          title: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["maintenance_category"]
          created_at?: string
          current_km?: number | null
          family_id?: string | null
          id?: string
          interval_type?: Database["public"]["Enums"]["maintenance_interval_type"]
          interval_value?: number | null
          last_done_date?: string | null
          next_due_date?: string | null
          notes?: string | null
          owner_user_id?: string | null
          pet_id?: string | null
          reminder_days_before?: number
          status?: Database["public"]["Enums"]["maintenance_status"]
          title?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_maintenance_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_maintenance_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_maintenance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          color: string | null
          created_at: string
          family_id: string | null
          id: string
          is_default: boolean
          issuer: string | null
          label: string
          last4: string | null
          owner_user_id: string | null
          type: Database["public"]["Enums"]["payment_method_type"]
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          family_id?: string | null
          id?: string
          is_default?: boolean
          issuer?: string | null
          label: string
          last4?: string | null
          owner_user_id?: string | null
          type?: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          family_id?: string | null
          id?: string
          is_default?: boolean
          issuer?: string | null
          label?: string
          last4?: string | null
          owner_user_id?: string | null
          type?: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      persons: {
        Row: {
          avatar_emoji: string | null
          birth_date: string | null
          comune_residenza: string | null
          created_at: string
          display_name: string
          family_id: string | null
          id: string
          is_minor: boolean
          kind: Database["public"]["Enums"]["person_kind"]
          linked_user_id: string | null
          notes: string | null
          owner_user_id: string | null
          species: string | null
          updated_at: string
        }
        Insert: {
          avatar_emoji?: string | null
          birth_date?: string | null
          comune_residenza?: string | null
          created_at?: string
          display_name: string
          family_id?: string | null
          id?: string
          is_minor?: boolean
          kind?: Database["public"]["Enums"]["person_kind"]
          linked_user_id?: string | null
          notes?: string | null
          owner_user_id?: string | null
          species?: string | null
          updated_at?: string
        }
        Update: {
          avatar_emoji?: string | null
          birth_date?: string | null
          comune_residenza?: string | null
          created_at?: string
          display_name?: string
          family_id?: string | null
          id?: string
          is_minor?: boolean
          kind?: Database["public"]["Enums"]["person_kind"]
          linked_user_id?: string | null
          notes?: string | null
          owner_user_id?: string | null
          species?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "persons_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          birth_date: string | null
          breed: string | null
          created_at: string
          family_id: string | null
          id: string
          name: string
          notes: string | null
          owner_user_id: string | null
          species: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          family_id?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_user_id?: string | null
          species?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          family_id?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_user_id?: string | null
          species?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          auto_renews: boolean
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          category: Database["public"]["Enums"]["subscription_category"]
          created_at: string
          currency: string
          family_id: string | null
          id: string
          name: string
          next_billing_date: string | null
          notes: string | null
          owner_user_id: string | null
          payment_method_id: string | null
          person_id: string | null
          provider: string | null
          reminder_days_before: number
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          auto_renews?: boolean
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          category?: Database["public"]["Enums"]["subscription_category"]
          created_at?: string
          currency?: string
          family_id?: string | null
          id?: string
          name: string
          next_billing_date?: string | null
          notes?: string | null
          owner_user_id?: string | null
          payment_method_id?: string | null
          person_id?: string | null
          provider?: string | null
          reminder_days_before?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          auto_renews?: boolean
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          category?: Database["public"]["Enums"]["subscription_category"]
          created_at?: string
          currency?: string
          family_id?: string | null
          id?: string
          name?: string
          next_billing_date?: string | null
          notes?: string | null
          owner_user_id?: string | null
          payment_method_id?: string | null
          person_id?: string | null
          provider?: string | null
          reminder_days_before?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string | null
          created_at: string
          family_id: string | null
          first_registration_date: string | null
          fuel_type: string | null
          id: string
          model: string | null
          notes: string | null
          owner_user_id: string | null
          person_id: string | null
          plate: string
          type: Database["public"]["Enums"]["vehicle_type"]
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          family_id?: string | null
          first_registration_date?: string | null
          fuel_type?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          owner_user_id?: string | null
          person_id?: string | null
          plate: string
          type?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          family_id?: string | null
          first_registration_date?: string | null
          fuel_type?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          owner_user_id?: string | null
          person_id?: string | null
          plate?: string
          type?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          amount: number
          code: string | null
          created_at: string
          currency: string
          expiry_date: string | null
          family_id: string | null
          id: string
          is_percentage: boolean
          issue_date: string | null
          issuer: string
          notes: string | null
          owner_user_id: string | null
          person_id: string | null
          status: Database["public"]["Enums"]["voucher_status"]
          type: Database["public"]["Enums"]["voucher_type"]
          updated_at: string
        }
        Insert: {
          amount?: number
          code?: string | null
          created_at?: string
          currency?: string
          expiry_date?: string | null
          family_id?: string | null
          id?: string
          is_percentage?: boolean
          issue_date?: string | null
          issuer: string
          notes?: string | null
          owner_user_id?: string | null
          person_id?: string | null
          status?: Database["public"]["Enums"]["voucher_status"]
          type?: Database["public"]["Enums"]["voucher_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          code?: string | null
          created_at?: string
          currency?: string
          expiry_date?: string | null
          family_id?: string | null
          id?: string
          is_percentage?: boolean
          issue_date?: string | null
          issuer?: string
          notes?: string | null
          owner_user_id?: string | null
          person_id?: string | null
          status?: Database["public"]["Enums"]["voucher_status"]
          type?: Database["public"]["Enums"]["voucher_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vouchers_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
      warranties: {
        Row: {
          brand: string | null
          created_at: string
          expiry_date: string | null
          extended_warranty_months: number | null
          family_id: string | null
          id: string
          model: string | null
          notes: string | null
          owner_user_id: string | null
          person_id: string | null
          product_name: string
          purchase_date: string
          purchase_price: number | null
          receipt_image_url: string | null
          serial_number: string | null
          store: string | null
          updated_at: string
          warranty_months: number
        }
        Insert: {
          brand?: string | null
          created_at?: string
          expiry_date?: string | null
          extended_warranty_months?: number | null
          family_id?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          owner_user_id?: string | null
          person_id?: string | null
          product_name: string
          purchase_date: string
          purchase_price?: number | null
          receipt_image_url?: string | null
          serial_number?: string | null
          store?: string | null
          updated_at?: string
          warranty_months?: number
        }
        Update: {
          brand?: string | null
          created_at?: string
          expiry_date?: string | null
          extended_warranty_months?: number | null
          family_id?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          owner_user_id?: string | null
          person_id?: string | null
          product_name?: string
          purchase_date?: string
          purchase_price?: number | null
          receipt_image_url?: string | null
          serial_number?: string | null
          store?: string | null
          updated_at?: string
          warranty_months?: number
        }
        Relationships: [
          {
            foreignKeyName: "warranties_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranties_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assert_same_scope: {
        Args: {
          child_family: string
          child_owner: string
          parent_family: string
          parent_label: string
          parent_owner: string
        }
        Returns: undefined
      }
      create_family: {
        Args: { p_display_name?: string; p_name: string }
        Returns: {
          created_at: string
          id: string
          invite_code: string
          name: string
        }
        SetofOptions: {
          from: "*"
          to: "families"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      generate_invite_code: { Args: never; Returns: string }
      is_family_member: { Args: { fid: string }; Returns: boolean }
      is_family_owner: { Args: { fid: string }; Returns: boolean }
      join_family_by_code: {
        Args: { code: string; name?: string }
        Returns: string
      }
      promote_personal_to_family: {
        Args: { categories?: string[]; target_family: string }
        Returns: Json
      }
    }
    Enums: {
      billing_cycle: "monthly" | "quarterly" | "semiannual" | "annual"
      deadline_status: "pending" | "done" | "snoozed"
      deadline_type:
        | "bollo_auto"
        | "revisione_auto"
        | "patente"
        | "cie"
        | "passaporto"
        | "spid"
        | "esenzione_ticket"
        | "ricetta_medica"
        | "visita_medica"
        | "assicurazione_auto"
        | "assicurazione_casa"
        | "contratto_affitto"
        | "dichiarazione_redditi"
        | "imu"
        | "tari"
        | "f24"
        | "custom"
      maintenance_category:
        | "caldaia"
        | "filtri_aria"
        | "estintore"
        | "tagliando_auto"
        | "cambio_gomme"
        | "visita_veterinaria"
        | "vaccino_animale"
        | "sverminazione"
        | "pulizia_canne_fumarie"
        | "altro"
      maintenance_interval_type: "months" | "km" | "once"
      maintenance_status: "pending" | "done"
      member_role: "owner" | "member"
      payment_method_type:
        | "credit_card"
        | "debit_card"
        | "bank_account"
        | "other"
      person_kind: "human" | "pet"
      subscription_category:
        | "streaming"
        | "musica"
        | "gaming"
        | "software"
        | "palestra"
        | "parcheggio"
        | "assicurazione"
        | "telefonia"
        | "internet"
        | "giornali"
        | "cloud_storage"
        | "altro"
      subscription_status: "active" | "cancelled" | "paused"
      vehicle_type: "auto" | "moto" | "altro"
      voucher_status: "available" | "used" | "expired"
      voucher_type:
        | "regalo"
        | "rimborso"
        | "reso"
        | "cashback"
        | "coupon"
        | "altro"
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
      billing_cycle: ["monthly", "quarterly", "semiannual", "annual"],
      deadline_status: ["pending", "done", "snoozed"],
      deadline_type: [
        "bollo_auto",
        "revisione_auto",
        "patente",
        "cie",
        "passaporto",
        "spid",
        "esenzione_ticket",
        "ricetta_medica",
        "visita_medica",
        "assicurazione_auto",
        "assicurazione_casa",
        "contratto_affitto",
        "dichiarazione_redditi",
        "imu",
        "tari",
        "f24",
        "custom",
      ],
      maintenance_category: [
        "caldaia",
        "filtri_aria",
        "estintore",
        "tagliando_auto",
        "cambio_gomme",
        "visita_veterinaria",
        "vaccino_animale",
        "sverminazione",
        "pulizia_canne_fumarie",
        "altro",
      ],
      maintenance_interval_type: ["months", "km", "once"],
      maintenance_status: ["pending", "done"],
      member_role: ["owner", "member"],
      payment_method_type: [
        "credit_card",
        "debit_card",
        "bank_account",
        "other",
      ],
      person_kind: ["human", "pet"],
      subscription_category: [
        "streaming",
        "musica",
        "gaming",
        "software",
        "palestra",
        "parcheggio",
        "assicurazione",
        "telefonia",
        "internet",
        "giornali",
        "cloud_storage",
        "altro",
      ],
      subscription_status: ["active", "cancelled", "paused"],
      vehicle_type: ["auto", "moto", "altro"],
      voucher_status: ["available", "used", "expired"],
      voucher_type: [
        "regalo",
        "rimborso",
        "reso",
        "cashback",
        "coupon",
        "altro",
      ],
    },
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      deadlines: {
        Row: {
          assigned_to_member_id: string | null
          created_at: string
          due_date: string
          family_id: string
          id: string
          is_recurring: boolean
          notes: string | null
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
          assigned_to_member_id?: string | null
          created_at?: string
          due_date: string
          family_id: string
          id?: string
          is_recurring?: boolean
          notes?: string | null
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
          assigned_to_member_id?: string | null
          created_at?: string
          due_date?: string
          family_id?: string
          id?: string
          is_recurring?: boolean
          notes?: string | null
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
        Relationships: []
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
        Relationships: []
      }
      home_maintenance: {
        Row: {
          category: Database["public"]["Enums"]["maintenance_category"]
          created_at: string
          current_km: number | null
          family_id: string
          id: string
          interval_type: Database["public"]["Enums"]["maintenance_interval_type"]
          interval_value: number | null
          last_done_date: string | null
          next_due_date: string | null
          notes: string | null
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
          family_id: string
          id?: string
          interval_type?: Database["public"]["Enums"]["maintenance_interval_type"]
          interval_value?: number | null
          last_done_date?: string | null
          next_due_date?: string | null
          notes?: string | null
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
          family_id?: string
          id?: string
          interval_type?: Database["public"]["Enums"]["maintenance_interval_type"]
          interval_value?: number | null
          last_done_date?: string | null
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string | null
          reminder_days_before?: number
          status?: Database["public"]["Enums"]["maintenance_status"]
          title?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: []
      }
      persons: {
        Row: {
          birth_date: string | null
          comune_residenza: string | null
          created_at: string
          display_name: string
          family_id: string
          id: string
          is_minor: boolean
          notes: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          comune_residenza?: string | null
          created_at?: string
          display_name: string
          family_id: string
          id?: string
          is_minor?: boolean
          notes?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          comune_residenza?: string | null
          created_at?: string
          display_name?: string
          family_id?: string
          id?: string
          is_minor?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pets: {
        Row: {
          birth_date: string | null
          breed: string | null
          created_at: string
          family_id: string
          id: string
          name: string
          notes: string | null
          species: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          family_id: string
          id?: string
          name: string
          notes?: string | null
          species?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          family_id?: string
          id?: string
          name?: string
          notes?: string | null
          species?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          auto_renews: boolean
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          category: Database["public"]["Enums"]["subscription_category"]
          created_at: string
          currency: string
          family_id: string
          id: string
          name: string
          next_billing_date: string | null
          notes: string | null
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
          family_id: string
          id?: string
          name: string
          next_billing_date?: string | null
          notes?: string | null
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
          family_id?: string
          id?: string
          name?: string
          next_billing_date?: string | null
          notes?: string | null
          person_id?: string | null
          provider?: string | null
          reminder_days_before?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string | null
          created_at: string
          family_id: string
          first_registration_date: string | null
          fuel_type: string | null
          id: string
          model: string | null
          notes: string | null
          person_id: string | null
          plate: string
          type: Database["public"]["Enums"]["vehicle_type"]
          updated_at: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          family_id: string
          first_registration_date?: string | null
          fuel_type?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          person_id?: string | null
          plate: string
          type?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          family_id?: string
          first_registration_date?: string | null
          fuel_type?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          person_id?: string | null
          plate?: string
          type?: Database["public"]["Enums"]["vehicle_type"]
          updated_at?: string
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          amount: number
          code: string | null
          created_at: string
          currency: string
          expiry_date: string | null
          family_id: string
          id: string
          is_percentage: boolean
          issue_date: string | null
          issuer: string
          notes: string | null
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
          family_id: string
          id?: string
          is_percentage?: boolean
          issue_date?: string | null
          issuer: string
          notes?: string | null
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
          family_id?: string
          id?: string
          is_percentage?: boolean
          issue_date?: string | null
          issuer?: string
          notes?: string | null
          person_id?: string | null
          status?: Database["public"]["Enums"]["voucher_status"]
          type?: Database["public"]["Enums"]["voucher_type"]
          updated_at?: string
        }
        Relationships: []
      }
      warranties: {
        Row: {
          brand: string | null
          created_at: string
          expiry_date: string | null
          extended_warranty_months: number | null
          family_id: string
          id: string
          model: string | null
          notes: string | null
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
          family_id: string
          id?: string
          model?: string | null
          notes?: string | null
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
          family_id?: string
          id?: string
          model?: string | null
          notes?: string | null
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
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      generate_invite_code: { Args: never; Returns: string }
      is_family_member: { Args: { fid: string }; Returns: boolean }
      is_family_owner: { Args: { fid: string }; Returns: boolean }
      join_family_by_code: {
        Args: { code: string; name?: string }
        Returns: string
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
    CompositeTypes: { [_ in never]: never }
  }
}

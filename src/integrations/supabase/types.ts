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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      battle_events: {
        Row: {
          child_id: string
          created_at: string
          duration_seconds: number
          event_type: string
          hunter_name: string
          id: string
          loot_collected: string[] | null
          metadata: Json | null
          monsters_defeated: number
          streak: number
          total_monsters: number
        }
        Insert: {
          child_id: string
          created_at?: string
          duration_seconds?: number
          event_type?: string
          hunter_name?: string
          id?: string
          loot_collected?: string[] | null
          metadata?: Json | null
          monsters_defeated?: number
          streak?: number
          total_monsters?: number
        }
        Update: {
          child_id?: string
          created_at?: string
          duration_seconds?: number
          event_type?: string
          hunter_name?: string
          id?: string
          loot_collected?: string[] | null
          metadata?: Json | null
          monsters_defeated?: number
          streak?: number
          total_monsters?: number
        }
        Relationships: []
      }
      consultation_payments: {
        Row: {
          amount: number
          consultation_id: string
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          status: string
          upi_transaction_id: string | null
          verified_at: string | null
        }
        Insert: {
          amount: number
          consultation_id: string
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          status?: string
          upi_transaction_id?: string | null
          verified_at?: string | null
        }
        Update: {
          amount?: number
          consultation_id?: string
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          status?: string
          upi_transaction_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_payments_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_requests: {
        Row: {
          accepted_at: string | null
          completed_at: string | null
          contact_phone: string | null
          created_at: string
          doctor_id: string | null
          id: string
          jitsi_room: string | null
          message: string | null
          patient_id: string
          patient_name: string
          payment_status: string
          preferred_mode: string
          scan_id: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          completed_at?: string | null
          contact_phone?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          jitsi_room?: string | null
          message?: string | null
          patient_id: string
          patient_name?: string
          payment_status?: string
          preferred_mode?: string
          scan_id?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          completed_at?: string | null
          contact_phone?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          jitsi_room?: string | null
          message?: string | null
          patient_id?: string
          patient_name?: string
          payment_status?: string
          preferred_mode?: string
          scan_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_requests_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "patient_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      family_links: {
        Row: {
          child_id: string
          created_at: string
          id: string
          link_code: string
          parent_id: string
          status: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          link_code: string
          parent_id: string
          status?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          link_code?: string
          parent_id?: string
          status?: string
        }
        Relationships: []
      }
      guardian_lockdowns: {
        Row: {
          device_id: string
          doctor_id: string
          id: string
          is_active: boolean
          recovered_at: string | null
          recovery_hash: string | null
          trigger_type: string
          triggered_at: string
        }
        Insert: {
          device_id?: string
          doctor_id: string
          id?: string
          is_active?: boolean
          recovered_at?: string | null
          recovery_hash?: string | null
          trigger_type?: string
          triggered_at?: string
        }
        Update: {
          device_id?: string
          doctor_id?: string
          id?: string
          is_active?: boolean
          recovered_at?: string | null
          recovery_hash?: string | null
          trigger_type?: string
          triggered_at?: string
        }
        Relationships: []
      }
      lesion_entries: {
        Row: {
          color_score: number | null
          created_at: string
          entry_day: number
          id: string
          image_url: string | null
          is_flagged: boolean
          lesion_id: string
          notes: string | null
          patient_id: string
          size_delta: string | null
          size_mm: number
          status: string
        }
        Insert: {
          color_score?: number | null
          created_at?: string
          entry_day: number
          id?: string
          image_url?: string | null
          is_flagged?: boolean
          lesion_id?: string
          notes?: string | null
          patient_id: string
          size_delta?: string | null
          size_mm: number
          status?: string
        }
        Update: {
          color_score?: number | null
          created_at?: string
          entry_day?: number
          id?: string
          image_url?: string | null
          is_flagged?: boolean
          lesion_id?: string
          notes?: string | null
          patient_id?: string
          size_delta?: string | null
          size_mm?: number
          status?: string
        }
        Relationships: []
      }
      pairing_codes: {
        Row: {
          child_id: string
          claimed: boolean
          code: string
          created_at: string
          expires_at: string
          hunter_name: string
          id: string
        }
        Insert: {
          child_id: string
          claimed?: boolean
          code: string
          created_at?: string
          expires_at?: string
          hunter_name?: string
          id?: string
        }
        Update: {
          child_id?: string
          claimed?: boolean
          code?: string
          created_at?: string
          expires_at?: string
          hunter_name?: string
          id?: string
        }
        Relationships: []
      }
      patient_scans: {
        Row: {
          ai_analysis: Json | null
          id: string
          image_url: string | null
          notes: string | null
          patient_id: string
          patient_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          scan_type: string
          status: string
          submitted_at: string
          urgency: string
        }
        Insert: {
          ai_analysis?: Json | null
          id?: string
          image_url?: string | null
          notes?: string | null
          patient_id: string
          patient_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          scan_type?: string
          status?: string
          submitted_at?: string
          urgency?: string
        }
        Update: {
          ai_analysis?: Json | null
          id?: string
          image_url?: string | null
          notes?: string | null
          patient_id?: string
          patient_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          scan_type?: string
          status?: string
          submitted_at?: string
          urgency?: string
        }
        Relationships: []
      }
      payment_claims: {
        Row: {
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          upi_transaction_id: string | null
          user_email: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          upi_transaction_id?: string | null
          user_email: string
          user_id: string
          user_name?: string
        }
        Update: {
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          upi_transaction_id?: string | null
          user_email?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          amount: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          payment_date: string
          payment_time: string
          reference_id: string
          status: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          amount?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          payment_date?: string
          payment_time?: string
          reference_id?: string
          status?: string
          transaction_id?: string
          user_id: string
        }
        Update: {
          amount?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          payment_date?: string
          payment_time?: string
          reference_id?: string
          status?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          consultation_fee: number
          created_at: string
          full_name: string
          id: string
          is_approved: boolean
          role: string
          screenshot_url: string | null
          upi_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          consultation_fee?: number
          created_at?: string
          full_name?: string
          id: string
          is_approved?: boolean
          role?: string
          screenshot_url?: string | null
          upi_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          consultation_fee?: number
          created_at?: string
          full_name?: string
          id?: string
          is_approved?: boolean
          role?: string
          screenshot_url?: string | null
          upi_id?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          feedback: string
          id: string
          rating: number
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          feedback?: string
          id?: string
          rating?: number
          user_id: string
          user_name?: string
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          rating?: number
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          expires_at: string | null
          id: string
          notes: string | null
          plan: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          notes?: string | null
          plan?: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          notes?: string | null
          plan?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      tongue_analyses: {
        Row: {
          confidence: number
          created_at: string
          dietary_log: string[] | null
          diseases: Json | null
          estimated_ph: number
          id: string
          image_url: string | null
          ph_range: string
          recovery: Json | null
          summary: string | null
          symptoms: string[] | null
          tongue_analysis: Json | null
          tongue_defects: Json | null
          user_id: string
          vitamin_deficiencies: Json | null
        }
        Insert: {
          confidence?: number
          created_at?: string
          dietary_log?: string[] | null
          diseases?: Json | null
          estimated_ph?: number
          id?: string
          image_url?: string | null
          ph_range?: string
          recovery?: Json | null
          summary?: string | null
          symptoms?: string[] | null
          tongue_analysis?: Json | null
          tongue_defects?: Json | null
          user_id: string
          vitamin_deficiencies?: Json | null
        }
        Update: {
          confidence?: number
          created_at?: string
          dietary_log?: string[] | null
          diseases?: Json | null
          estimated_ph?: number
          id?: string
          image_url?: string | null
          ph_range?: string
          recovery?: Json | null
          summary?: string | null
          symptoms?: string[] | null
          tongue_analysis?: Json | null
          tongue_defects?: Json | null
          user_id?: string
          vitamin_deficiencies?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "dentist" | "patient"
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
      app_role: ["dentist", "patient"],
    },
  },
} as const

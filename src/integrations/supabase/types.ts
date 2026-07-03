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
      booking_seats: {
        Row: {
          booking_id: string
          id: string
          price: number
          seat_id: string
        }
        Insert: {
          booking_id: string
          id?: string
          price?: number
          seat_id: string
        }
        Update: {
          booking_id?: string
          id?: string
          price?: number
          seat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_seats_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_seats_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: true
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_code: string
          created_at: string
          event_id: string
          id: string
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          user_id: string
        }
        Insert: {
          booking_code?: string
          created_at?: string
          event_id: string
          id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          user_id: string
        }
        Update: {
          booking_code?: string
          created_at?: string
          event_id?: string
          id?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_rating: string | null
          banner_url: string | null
          base_price: number
          city: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          event_type: Database["public"]["Enums"]["event_type"]
          gallery: Json | null
          genre: string | null
          id: string
          language: string | null
          organizer_id: string
          starts_at: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          age_rating?: string | null
          banner_url?: string | null
          base_price?: number
          city?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          event_type: Database["public"]["Enums"]["event_type"]
          gallery?: Json | null
          genre?: string | null
          id?: string
          language?: string | null
          organizer_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          age_rating?: string | null
          banner_url?: string | null
          base_price?: number
          city?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          event_type?: Database["public"]["Enums"]["event_type"]
          gallery?: Json | null
          genre?: string | null
          id?: string
          language?: string | null
          organizer_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          method: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          organizer_company: string | null
          organizer_status:
            | Database["public"]["Enums"]["organizer_status"]
            | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          organizer_company?: string | null
          organizer_status?:
            | Database["public"]["Enums"]["organizer_status"]
            | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organizer_company?: string | null
          organizer_status?:
            | Database["public"]["Enums"]["organizer_status"]
            | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seat_categories: {
        Row: {
          color: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          color?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          color?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      seats: {
        Row: {
          category_id: string | null
          event_id: string
          held_by: string | null
          held_until: string | null
          id: string
          price: number
          row_label: string
          seat_number: number
          status: Database["public"]["Enums"]["seat_status"]
        }
        Insert: {
          category_id?: string | null
          event_id: string
          held_by?: string | null
          held_until?: string | null
          id?: string
          price?: number
          row_label: string
          seat_number: number
          status?: Database["public"]["Enums"]["seat_status"]
        }
        Update: {
          category_id?: string | null
          event_id?: string
          held_by?: string | null
          held_until?: string | null
          id?: string
          price?: number
          row_label?: string
          seat_number?: number
          status?: Database["public"]["Enums"]["seat_status"]
        }
        Relationships: [
          {
            foreignKeyName: "seats_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "seat_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seats_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          capacity: number
          city: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          address?: string | null
          capacity?: number
          city: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          address?: string | null
          capacity?: number
          city?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          event_id: string
          id: string
          offered_until: string | null
          seats_wanted: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          offered_until?: string | null
          seats_wanted?: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          offered_until?: string | null
          seats_wanted?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "organizer" | "customer"
      booking_status: "pending" | "confirmed" | "cancelled" | "refunded"
      event_status:
        | "draft"
        | "pending"
        | "published"
        | "cancelled"
        | "completed"
      event_type: "movie" | "concert"
      organizer_status: "pending" | "approved" | "rejected"
      payment_status: "pending" | "success" | "failed" | "refunded"
      seat_status: "available" | "held" | "booked" | "disabled"
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
      app_role: ["admin", "organizer", "customer"],
      booking_status: ["pending", "confirmed", "cancelled", "refunded"],
      event_status: ["draft", "pending", "published", "cancelled", "completed"],
      event_type: ["movie", "concert"],
      organizer_status: ["pending", "approved", "rejected"],
      payment_status: ["pending", "success", "failed", "refunded"],
      seat_status: ["available", "held", "booked", "disabled"],
    },
  },
} as const

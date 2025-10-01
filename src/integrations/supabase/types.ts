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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      albums: {
        Row: {
          album_artist: string
          album_duration: unknown | null
          album_name: string
          album_type: Database["public"]["Enums"]["album_type"]
          artwork_back: string | null
          artwork_front: string
          artwork_fullcover: string | null
          artwork_fullinner: string | null
          artwork_sleeve: string | null
          artwork_sticker: string | null
          catalog_number: string
          commentary: string | null
          created_at: string | null
          distributor: string | null
          engineers: Json | null
          id: string
          key_contributors: Json | null
          label: string | null
          mastering: Json | null
          producers: Json | null
          purchase_links: Json | null
          release_date: string | null
          removal_date: string | null
          status: Database["public"]["Enums"]["album_status"]
          streaming_links: Json | null
          upc: string | null
          updated_at: string | null
          vinyl_cd_release_date: string | null
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          album_artist: string
          album_duration?: unknown | null
          album_name: string
          album_type: Database["public"]["Enums"]["album_type"]
          artwork_back?: string | null
          artwork_front: string
          artwork_fullcover?: string | null
          artwork_fullinner?: string | null
          artwork_sleeve?: string | null
          artwork_sticker?: string | null
          catalog_number: string
          commentary?: string | null
          created_at?: string | null
          distributor?: string | null
          engineers?: Json | null
          id?: string
          key_contributors?: Json | null
          label?: string | null
          mastering?: Json | null
          producers?: Json | null
          purchase_links?: Json | null
          release_date?: string | null
          removal_date?: string | null
          status?: Database["public"]["Enums"]["album_status"]
          streaming_links?: Json | null
          upc?: string | null
          updated_at?: string | null
          vinyl_cd_release_date?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          album_artist?: string
          album_duration?: unknown | null
          album_name?: string
          album_type?: Database["public"]["Enums"]["album_type"]
          artwork_back?: string | null
          artwork_front?: string
          artwork_fullcover?: string | null
          artwork_fullinner?: string | null
          artwork_sleeve?: string | null
          artwork_sticker?: string | null
          catalog_number?: string
          commentary?: string | null
          created_at?: string | null
          distributor?: string | null
          engineers?: Json | null
          id?: string
          key_contributors?: Json | null
          label?: string | null
          mastering?: Json | null
          producers?: Json | null
          purchase_links?: Json | null
          release_date?: string | null
          removal_date?: string | null
          status?: Database["public"]["Enums"]["album_status"]
          streaming_links?: Json | null
          upc?: string | null
          updated_at?: string | null
          vinyl_cd_release_date?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: []
      }
      tracks: {
        Row: {
          album_id: string
          allow_stream: boolean | null
          artists: Json | null
          commentary: string | null
          composers: Json | null
          created_at: string | null
          duration: unknown
          isrc: string | null
          key_contributors: Json | null
          purchase_link: string | null
          stage_date: string
          stage_of_production: Database["public"]["Enums"]["production_stage"]
          stream_embed: string | null
          track_id: string
          track_name: string
          track_number: number
          track_status: Database["public"]["Enums"]["track_status"]
          updated_at: string | null
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          album_id: string
          allow_stream?: boolean | null
          artists?: Json | null
          commentary?: string | null
          composers?: Json | null
          created_at?: string | null
          duration: unknown
          isrc?: string | null
          key_contributors?: Json | null
          purchase_link?: string | null
          stage_date?: string
          stage_of_production?: Database["public"]["Enums"]["production_stage"]
          stream_embed?: string | null
          track_id?: string
          track_name: string
          track_number: number
          track_status?: Database["public"]["Enums"]["track_status"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          album_id?: string
          allow_stream?: boolean | null
          artists?: Json | null
          commentary?: string | null
          composers?: Json | null
          created_at?: string | null
          duration?: unknown
          isrc?: string | null
          key_contributors?: Json | null
          purchase_link?: string | null
          stage_date?: string
          stage_of_production?: Database["public"]["Enums"]["production_stage"]
          stream_embed?: string | null
          track_id?: string
          track_name?: string
          track_number?: number
          track_status?: Database["public"]["Enums"]["track_status"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: [
          {
            foreignKeyName: "tracks_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      album_status: "In Development" | "Released" | "Removed"
      album_type: "EP" | "LP" | "SP" | "Compilation"
      app_role: "admin" | "user"
      production_stage:
        | "CONCEPTION"
        | "DEMO"
        | "IN SESSION"
        | "OUT SESSION"
        | "IN MIX"
        | "OUT MIX"
        | "IN MASTERING"
        | "OUT MASTERING"
        | "SHELVED"
        | "REMOVED"
        | "RELEASED"
      track_status: "WIP" | "B-SIDE" | "RELEASED" | "SHELVED"
      visibility_level: "Public" | "VIP" | "Admin"
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
      album_status: ["In Development", "Released", "Removed"],
      album_type: ["EP", "LP", "SP", "Compilation"],
      app_role: ["admin", "user"],
      production_stage: [
        "CONCEPTION",
        "DEMO",
        "IN SESSION",
        "OUT SESSION",
        "IN MIX",
        "OUT MIX",
        "IN MASTERING",
        "OUT MASTERING",
        "SHELVED",
        "REMOVED",
        "RELEASED",
      ],
      track_status: ["WIP", "B-SIDE", "RELEASED", "SHELVED"],
      visibility_level: ["Public", "VIP", "Admin"],
    },
  },
} as const

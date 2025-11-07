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
      Cuarto: {
        Row: {
          caracteristicas:
            | Database["public"]["Enums"]["caracteristica_tipo"][]
            | null
          estados: Database["public"]["Enums"]["estados"]
          id_cuarto: number
          numero: number | null
          piso_id: number | null
          precio_por_noche: number | null
        }
        Insert: {
          caracteristicas?:
            | Database["public"]["Enums"]["caracteristica_tipo"][]
            | null
          estados?: Database["public"]["Enums"]["estados"]
          id_cuarto?: number
          numero?: number | null
          piso_id?: number | null
          precio_por_noche?: number | null
        }
        Update: {
          caracteristicas?:
            | Database["public"]["Enums"]["caracteristica_tipo"][]
            | null
          estados?: Database["public"]["Enums"]["estados"]
          id_cuarto?: number
          numero?: number | null
          piso_id?: number | null
          precio_por_noche?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Cuarto_piso_id_fkey"
            columns: ["piso_id"]
            isOneToOne: false
            referencedRelation: "Piso"
            referencedColumns: ["id_piso"]
          },
        ]
      }
      Huesped: {
        Row: {
          dni: string | null
          id_huesped: number
          nombre: string | null
        }
        Insert: {
          dni?: string | null
          id_huesped?: number
          nombre?: string | null
        }
        Update: {
          dni?: string | null
          id_huesped?: number
          nombre?: string | null
        }
        Relationships: []
      }
      Piso: {
        Row: {
          id_piso: number
          numero: number | null
        }
        Insert: {
          id_piso?: number
          numero?: number | null
        }
        Update: {
          id_piso?: number
          numero?: number | null
        }
        Relationships: []
      }
      Reserva: {
        Row: {
          cuarto_id: number | null
          fecha_entrada: string | null
          fecha_salida: string | null
          huesped_id: number | null
          id_reserva: number
          total: number | null
        }
        Insert: {
          cuarto_id?: number | null
          fecha_entrada?: string | null
          fecha_salida?: string | null
          huesped_id?: number | null
          id_reserva?: number
          total?: number | null
        }
        Update: {
          cuarto_id?: number | null
          fecha_entrada?: string | null
          fecha_salida?: string | null
          huesped_id?: number | null
          id_reserva?: number
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Reserva_cuarto_id_fkey"
            columns: ["cuarto_id"]
            isOneToOne: false
            referencedRelation: "Cuarto"
            referencedColumns: ["id_cuarto"]
          },
          {
            foreignKeyName: "Reserva_huesped_id_fkey"
            columns: ["huesped_id"]
            isOneToOne: false
            referencedRelation: "Huesped"
            referencedColumns: ["id_huesped"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      caracteristica_tipo:
        | "tv"
        | "wifi"
        | "aire_acondicionado"
        | "baño_privado"
        | "jacuzzi"
      estados: "disponible" | "ocupado"
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
      caracteristica_tipo: [
        "tv",
        "wifi",
        "aire_acondicionado",
        "baño_privado",
        "jacuzzi",
      ],
      estados: ["disponible", "ocupado"],
    },
  },
} as const

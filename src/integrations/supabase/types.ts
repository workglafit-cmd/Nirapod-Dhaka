export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      hospitals: {
        Row: {
          beds_available: number;
          created_at: string;
          icu_available: number;
          id: string;
          lat: number;
          lng: number;
          name: string;
          phone: string | null;
        };
        Insert: {
          beds_available?: number;
          created_at?: string;
          icu_available?: number;
          id?: string;
          lat: number;
          lng: number;
          name: string;
          phone?: string | null;
        };
        Update: {
          beds_available?: number;
          created_at?: string;
          icu_available?: number;
          id?: string;
          lat?: number;
          lng?: number;
          name?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      police_stations: {
        Row: {
          created_at: string;
          id: string;
          lat: number;
          lng: number;
          name: string;
          phone: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          lat: number;
          lng: number;
          name: string;
          phone?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          lat?: number;
          lng?: number;
          name?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          full_name: string;
          id: string;
          phone: string | null;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          full_name?: string;
          id: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          full_name?: string;
          id?: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      report_votes: {
        Row: {
          created_at: string;
          id: string;
          report_id: string;
          user_id: string;
          vote: Database["public"]["Enums"]["vote_kind"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          report_id: string;
          user_id: string;
          vote: Database["public"]["Enums"]["vote_kind"];
        };
        Update: {
          created_at?: string;
          id?: string;
          report_id?: string;
          user_id?: string;
          vote?: Database["public"]["Enums"]["vote_kind"];
        };
        Relationships: [
          {
            foreignKeyName: "report_votes_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          area_name: string | null;
          created_at: string;
          description: string;
          id: string;
          lat: number;
          lng: number;
          photo_url: string | null;
          reporter_id: string | null;
          status: Database["public"]["Enums"]["report_status"];
          subtype: string | null;
          type: Database["public"]["Enums"]["report_type"];
          updated_at: string;
        };
        Insert: {
          area_name?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          lat: number;
          lng: number;
          photo_url?: string | null;
          reporter_id?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          subtype?: string | null;
          type: Database["public"]["Enums"]["report_type"];
          updated_at?: string;
        };
        Update: {
          area_name?: string | null;
          created_at?: string;
          description?: string;
          id?: string;
          lat?: number;
          lng?: number;
          photo_url?: string | null;
          reporter_id?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          subtype?: string | null;
          type?: Database["public"]["Enums"]["report_type"];
          updated_at?: string;
        };
        Relationships: [];
      };
      sos_alerts: {
        Row: {
          contact_notified: boolean;
          created_at: string;
          id: string;
          lat: number;
          lng: number;
          nearest_station_id: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          contact_notified?: boolean;
          created_at?: string;
          id?: string;
          lat: number;
          lng: number;
          nearest_station_id?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          contact_notified?: boolean;
          created_at?: string;
          id?: string;
          lat?: number;
          lng?: number;
          nearest_station_id?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sos_alerts_nearest_station_id_fkey";
            columns: ["nearest_station_id"];
            isOneToOne: false;
            referencedRelation: "police_stations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      crime_hotspots: {
        Args: never;
        Returns: {
          lat: number;
          lng: number;
          report_count: number;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_authority: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "citizen" | "police" | "dmb" | "city_corp";
      report_status: "sent" | "received" | "resolved";
      report_type: "crime" | "infrastructure" | "accident";
      vote_kind: "confirm" | "dispute";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["citizen", "police", "dmb", "city_corp"],
      report_status: ["sent", "received", "resolved"],
      report_type: ["crime", "infrastructure", "accident"],
      vote_kind: ["confirm", "dispute"],
    },
  },
} as const;

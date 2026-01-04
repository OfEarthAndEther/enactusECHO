export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      bins: {
        Row: {
          created_at: string | null;
          id: number;
          last_emptied_at: string | null;
          latitude: number | null;
          location_description: string | null;
          longitude: number | null;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          last_emptied_at?: string | null;
          latitude?: number | null;
          location_description?: string | null;
          longitude?: number | null;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          last_emptied_at?: string | null;
          latitude?: number | null;
          location_description?: string | null;
          longitude?: number | null;
          name?: string;
        };
        Relationships: [];
      };
      partners: {
        Row: {
          coupon_details: string | null;
          created_at: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          type: string | null;
          website_url: string | null;
        };
        Insert: {
          coupon_details?: string | null;
          created_at?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          type?: string | null;
          website_url?: string | null;
        };
        Update: {
          coupon_details?: string | null;
          created_at?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          type?: string | null;
          website_url?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          college_id: string;
          created_at: string | null;
          department: string | null;
          email: string;
          full_name: string;
          id: string;
          is_active: boolean | null;
          points_total: number | null;
          roll_no: string | null;
        };
        Insert: {
          college_id: string;
          created_at?: string | null;
          department?: string | null;
          email: string;
          full_name: string;
          id: string;
          is_active?: boolean | null;
          points_total?: number | null;
          roll_no?: string | null;
        };
        Update: {
          college_id?: string;
          created_at?: string | null;
          department?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean | null;
          points_total?: number | null;
          roll_no?: string | null;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          bag_number: string | null;
          bin_id: number | null;
          created_at: string | null;
          id: string;
          notes: string | null;
          photo_url: string | null;
          points_earned: number | null;
          quantity: number;
          unit: string;
          user_id: string;
          verification_comment: string | null;
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null;
          verified_at: string | null;
          verified_by: string | null;
          waste_type: Database["public"]["Enums"]["waste_type"];
        };
        Insert: {
          bag_number?: string | null;
          bin_id?: number | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          photo_url?: string | null;
          points_earned?: number | null;
          quantity: number;
          unit: string;
          user_id: string;
          verification_comment?: string | null;
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null;
          verified_at?: string | null;
          verified_by?: string | null;
          waste_type: Database["public"]["Enums"]["waste_type"];
        };
        Update: {
          bag_number?: string | null;
          bin_id?: number | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          photo_url?: string | null;
          points_earned?: number | null;
          quantity?: number;
          unit?: string;
          user_id?: string;
          verification_comment?: string | null;
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null;
          verified_at?: string | null;
          verified_by?: string | null;
          waste_type?: Database["public"]["Enums"]["waste_type"];
        };
        Relationships: [
          {
            foreignKeyName: "submissions_bin_id_fkey";
            columns: ["bin_id"];
            isOneToOne: false;
            referencedRelation: "bins";
            referencedColumns: ["id"];
          }
        ];
      };
      vouchers: {
        Row: {
          id: string;
          name: string | null;
          description?: string | null;
          points: number;
          quantity: number | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          description?: string | null;
          points?: number;
          quantity?: number | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          description?: string | null;
          points?: number;
          quantity?: number | null;
        };
        Relationships: [];
      };
      availableCodes: {
        Row: {
          voucher_name: string | null;
          code: string | null;
          valid_till: Date;
        };
        Insert: {
          voucher_name?: string | null;
          code?: string | null;
          valid_till?: Date;
        };
        Update: {
          voucher_name?: string | null;
          code?: string | null;
          valid_till?: Date;
        };
        Relationships: [];
      };
      redeemed: {
        Row: {
          id: string;
          user_id: string;
          code: string | null;
          voucher_name: string | null;
          description: string | null;
          valid_till: Date;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: string | null;
          voucher_name?: string | null;
          description?: string | null;
          valid_till?: Date;
        };
        Update: {
          id?: string;
          user_id: string;
          code: string | null;
          voucher_name?: string | null;
          description?: string | null;
          valid_till?: Date;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "normal" | "admin" | "superadmin";
      verification_status: "pending" | "verified" | "rejected";
      waste_type:
        | "battery"
        | "charger"
        | "cable_wire"
        | "mouse_keyboard"
        | "monitor"
        | "cpu"
        | "mobile"
        | "accessories"
        | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
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
      app_role: ["normal", "admin", "superadmin"],
      verification_status: ["pending", "verified", "rejected"],
      waste_type: [
        "battery",
        "charger",
        "cable_wire",
        "mouse_keyboard",
        "monitor",
        "cpu",
        "mobile",
        "accessories",
        "other",
      ],
    },
  },
} as const;

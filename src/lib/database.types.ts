// All code in ENGLISH, UI labels in PORTUGUESE
// Supabase Database TypeScript types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string
          name: string
          start_date: string
          players: Json
          rounds: Json
          status: string
          last_updated: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          start_date: string
          players: Json
          rounds: Json
          status: string
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          players?: Json
          rounds?: Json
          status?: string
          last_updated?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

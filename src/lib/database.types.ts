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
          status: string
          is_active: boolean
          last_updated: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          start_date: string
          status: string
          is_active?: boolean
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_date?: string
          status?: string
          is_active?: boolean
          last_updated?: string
          created_at?: string
        }
      }
      players: {
        Row: {
          id: string
          tournament_id: string
          name: string
          position: string
          points: number
          balance: number
          scored: number
          conceded: number
          wins: number
          draws: number
          losses: number
          games_played: number
          created_at: string
        }
        Insert: {
          id: string
          tournament_id: string
          name: string
          position: string
          points?: number
          balance?: number
          scored?: number
          conceded?: number
          wins?: number
          draws?: number
          losses?: number
          games_played?: number
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          position?: string
          points?: number
          balance?: number
          scored?: number
          conceded?: number
          wins?: number
          draws?: number
          losses?: number
          games_played?: number
          created_at?: string
        }
      }
      rounds: {
        Row: {
          id: string
          tournament_id: string
          number: number
          status: string
          configured_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          tournament_id: string
          number: number
          status?: string
          configured_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          number?: number
          status?: string
          configured_at?: string | null
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          round_id: string
          court: string
          pair1_drive_player_id: string
          pair1_backhand_player_id: string
          pair2_drive_player_id: string
          pair2_backhand_player_id: string
          pair1_score: number
          pair2_score: number
          status: string
          match_order: number
          start_time: string | null
          end_time: string | null
          created_at: string
        }
        Insert: {
          id: string
          round_id: string
          court: string
          pair1_drive_player_id: string
          pair1_backhand_player_id: string
          pair2_drive_player_id: string
          pair2_backhand_player_id: string
          pair1_score?: number
          pair2_score?: number
          status?: string
          match_order: number
          start_time?: string | null
          end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          round_id?: string
          court?: string
          pair1_drive_player_id?: string
          pair1_backhand_player_id?: string
          pair2_drive_player_id?: string
          pair2_backhand_player_id?: string
          pair1_score?: number
          pair2_score?: number
          status?: string
          match_order?: number
          start_time?: string | null
          end_time?: string | null
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

// Tipos do Supabase podem ser gerados com:
// npx supabase gen types typescript --project-id your-project-id > lib/supabase/types.ts

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
      // Adicione os tipos das suas tabelas aqui
    }
    Views: {
      // Adicione os tipos das suas views aqui
    }
    Functions: {
      // Adicione os tipos das suas functions aqui
    }
    Enums: {
      // Adicione os tipos dos seus enums aqui
    }
  }
}


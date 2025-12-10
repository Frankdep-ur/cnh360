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
      alunos: {
        Row: {
          categoria_pretendida: Database["public"]["Enums"]["categoria_cnh"]
          created_at: string
          exame_pratico_aprovado: boolean | null
          exame_teorico_aprovado: boolean | null
          horas_praticas_completadas: number | null
          horas_praticas_total: number | null
          id: string
          objetivo: Database["public"]["Enums"]["objetivo_aluno"]
          possui_carro_proprio: boolean | null
          renach: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria_pretendida: Database["public"]["Enums"]["categoria_cnh"]
          created_at?: string
          exame_pratico_aprovado?: boolean | null
          exame_teorico_aprovado?: boolean | null
          horas_praticas_completadas?: number | null
          horas_praticas_total?: number | null
          id?: string
          objetivo: Database["public"]["Enums"]["objetivo_aluno"]
          possui_carro_proprio?: boolean | null
          renach?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria_pretendida?: Database["public"]["Enums"]["categoria_cnh"]
          created_at?: string
          exame_pratico_aprovado?: boolean | null
          exame_teorico_aprovado?: boolean | null
          horas_praticas_completadas?: number | null
          horas_praticas_total?: number | null
          id?: string
          objetivo?: Database["public"]["Enums"]["objetivo_aluno"]
          possui_carro_proprio?: boolean | null
          renach?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      aulas: {
        Row: {
          aluno_id: string
          codigo_validacao: string | null
          created_at: string
          data_hora: string
          duracao_minutos: number
          id: string
          instrutor_id: string
          latitude_encontro: number | null
          longitude_encontro: number | null
          observacoes: string | null
          ponto_encontro: string | null
          status: Database["public"]["Enums"]["status_aula"]
          updated_at: string
          usa_carro_aluno: boolean | null
          validada_em: string | null
          valor: number
          veiculo_id: string | null
        }
        Insert: {
          aluno_id: string
          codigo_validacao?: string | null
          created_at?: string
          data_hora: string
          duracao_minutos?: number
          id?: string
          instrutor_id: string
          latitude_encontro?: number | null
          longitude_encontro?: number | null
          observacoes?: string | null
          ponto_encontro?: string | null
          status?: Database["public"]["Enums"]["status_aula"]
          updated_at?: string
          usa_carro_aluno?: boolean | null
          validada_em?: string | null
          valor: number
          veiculo_id?: string | null
        }
        Update: {
          aluno_id?: string
          codigo_validacao?: string | null
          created_at?: string
          data_hora?: string
          duracao_minutos?: number
          id?: string
          instrutor_id?: string
          latitude_encontro?: number | null
          longitude_encontro?: number | null
          observacoes?: string | null
          ponto_encontro?: string | null
          status?: Database["public"]["Enums"]["status_aula"]
          updated_at?: string
          usa_carro_aluno?: boolean | null
          validada_em?: string | null
          valor?: number
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aulas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aulas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      autoescolas: {
        Row: {
          ativa: boolean | null
          cep: string | null
          cidade: string | null
          cnpj: string
          created_at: string
          credencial_detran: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome_fantasia: string | null
          razao_social: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativa?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj: string
          created_at?: string
          credencial_detran: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome_fantasia?: string | null
          razao_social: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativa?: boolean | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string
          created_at?: string
          credencial_detran?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome_fantasia?: string | null
          razao_social?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          aluno_id: string
          aula_id: string
          comentario: string | null
          created_at: string
          id: string
          instrutor_id: string
          nota: number
        }
        Insert: {
          aluno_id: string
          aula_id: string
          comentario?: string | null
          created_at?: string
          id?: string
          instrutor_id: string
          nota: number
        }
        Update: {
          aluno_id?: string
          aula_id?: string
          comentario?: string | null
          created_at?: string
          id?: string
          instrutor_id?: string
          nota?: number
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: true
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores"
            referencedColumns: ["id"]
          },
        ]
      }
      disponibilidade: {
        Row: {
          ativo: boolean | null
          created_at: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id: string
          instrutor_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id?: string
          instrutor_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          dia_semana?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
          instrutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disponibilidade_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores"
            referencedColumns: ["id"]
          },
        ]
      }
      instrutores: {
        Row: {
          ativo: boolean | null
          autoescola_id: string | null
          bio: string | null
          cnh_categoria: Database["public"]["Enums"]["categoria_cnh"]
          cnh_numero: string
          cnh_validade: string
          created_at: string
          credencial_detran: string
          id: string
          mei_cnpj: string | null
          nota_media: number | null
          preco_hora: number
          raio_atendimento_km: number | null
          total_aulas: number | null
          total_avaliacoes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          autoescola_id?: string | null
          bio?: string | null
          cnh_categoria: Database["public"]["Enums"]["categoria_cnh"]
          cnh_numero: string
          cnh_validade: string
          created_at?: string
          credencial_detran: string
          id?: string
          mei_cnpj?: string | null
          nota_media?: number | null
          preco_hora?: number
          raio_atendimento_km?: number | null
          total_aulas?: number | null
          total_avaliacoes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          autoescola_id?: string | null
          bio?: string | null
          cnh_categoria?: Database["public"]["Enums"]["categoria_cnh"]
          cnh_numero?: string
          cnh_validade?: string
          created_at?: string
          credencial_detran?: string
          id?: string
          mei_cnpj?: string | null
          nota_media?: number | null
          preco_hora?: number
          raio_atendimento_km?: number | null
          total_aulas?: number | null
          total_avaliacoes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instrutores_autoescola_id_fkey"
            columns: ["autoescola_id"]
            isOneToOne: false
            referencedRelation: "autoescolas"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_renach: {
        Row: {
          aluno_id: string
          created_at: string
          dados: Json | null
          erro: string | null
          id: string
          status: string
          tipo_operacao: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          dados?: Json | null
          erro?: string | null
          id?: string
          status?: string
          tipo_operacao: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          dados?: Json | null
          erro?: string | null
          id?: string
          status?: string
          tipo_operacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_renach_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          aluno_id: string
          aula_id: string | null
          created_at: string
          external_id: string | null
          id: string
          instrutor_id: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          pago_em: string | null
          status: Database["public"]["Enums"]["status_pagamento"]
          taxa_plataforma: number
          updated_at: string
          valor_bruto: number
          valor_instrutor: number
        }
        Insert: {
          aluno_id: string
          aula_id?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          instrutor_id: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          pago_em?: string | null
          status?: Database["public"]["Enums"]["status_pagamento"]
          taxa_plataforma: number
          updated_at?: string
          valor_bruto: number
          valor_instrutor: number
        }
        Update: {
          aluno_id?: string
          aula_id?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          instrutor_id?: string
          metodo?: Database["public"]["Enums"]["metodo_pagamento"]
          pago_em?: string | null
          status?: Database["public"]["Enums"]["status_pagamento"]
          taxa_plataforma?: number
          updated_at?: string
          valor_bruto?: number
          valor_instrutor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      progresso_renach: {
        Row: {
          aluno_id: string
          aulas_praticas_conclusao: string | null
          aulas_praticas_inicio: string | null
          cnh_emitida_em: string | null
          created_at: string
          curso_teorico_conclusao: string | null
          curso_teorico_inicio: string | null
          etapa_atual: string
          exame_pratico_data: string | null
          exame_pratico_resultado: string | null
          exame_teorico_data: string | null
          exame_teorico_resultado: string | null
          id: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          aulas_praticas_conclusao?: string | null
          aulas_praticas_inicio?: string | null
          cnh_emitida_em?: string | null
          created_at?: string
          curso_teorico_conclusao?: string | null
          curso_teorico_inicio?: string | null
          etapa_atual?: string
          exame_pratico_data?: string | null
          exame_pratico_resultado?: string | null
          exame_teorico_data?: string | null
          exame_teorico_resultado?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          aulas_praticas_conclusao?: string | null
          aulas_praticas_inicio?: string | null
          cnh_emitida_em?: string | null
          created_at?: string
          curso_teorico_conclusao?: string | null
          curso_teorico_inicio?: string | null
          etapa_atual?: string
          exame_pratico_data?: string | null
          exame_pratico_resultado?: string | null
          exame_teorico_data?: string | null
          exame_teorico_resultado?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_renach_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: true
            referencedRelation: "alunos"
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
      validacoes_gps: {
        Row: {
          aula_id: string
          device_info: Json | null
          id: string
          latitude: number
          longitude: number
          precisao_metros: number | null
          timestamp: string
          tipo: string
        }
        Insert: {
          aula_id: string
          device_info?: Json | null
          id?: string
          latitude: number
          longitude: number
          precisao_metros?: number | null
          timestamp?: string
          tipo: string
        }
        Update: {
          aula_id?: string
          device_info?: Json | null
          id?: string
          latitude?: number
          longitude?: number
          precisao_metros?: number | null
          timestamp?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "validacoes_gps_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano: number | null
          ativo: boolean | null
          categoria: Database["public"]["Enums"]["categoria_cnh"]
          created_at: string
          id: string
          instrutor_id: string
          modelo: string
          placa: string
          transmissao: Database["public"]["Enums"]["tipo_transmissao"]
        }
        Insert: {
          ano?: number | null
          ativo?: boolean | null
          categoria?: Database["public"]["Enums"]["categoria_cnh"]
          created_at?: string
          id?: string
          instrutor_id: string
          modelo: string
          placa: string
          transmissao?: Database["public"]["Enums"]["tipo_transmissao"]
        }
        Update: {
          ano?: number | null
          ativo?: boolean | null
          categoria?: Database["public"]["Enums"]["categoria_cnh"]
          created_at?: string
          id?: string
          instrutor_id?: string
          modelo?: string
          placa?: string
          transmissao?: Database["public"]["Enums"]["tipo_transmissao"]
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores"
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
      app_role: "admin" | "aluno" | "instrutor" | "autoescola"
      categoria_cnh: "ACC" | "A" | "B" | "AB" | "C" | "D" | "E"
      metodo_pagamento: "pix" | "cartao_credito" | "cartao_debito" | "boleto"
      objetivo_aluno:
        | "primeira_habilitacao"
        | "adicao_categoria"
        | "renovacao"
        | "mudanca_categoria"
      status_aula:
        | "pendente"
        | "confirmada"
        | "em_andamento"
        | "concluida"
        | "cancelada"
      status_pagamento:
        | "pendente"
        | "processando"
        | "aprovado"
        | "recusado"
        | "estornado"
      tipo_transmissao: "manual" | "automatico" | "ambos"
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
      app_role: ["admin", "aluno", "instrutor", "autoescola"],
      categoria_cnh: ["ACC", "A", "B", "AB", "C", "D", "E"],
      metodo_pagamento: ["pix", "cartao_credito", "cartao_debito", "boleto"],
      objetivo_aluno: [
        "primeira_habilitacao",
        "adicao_categoria",
        "renovacao",
        "mudanca_categoria",
      ],
      status_aula: [
        "pendente",
        "confirmada",
        "em_andamento",
        "concluida",
        "cancelada",
      ],
      status_pagamento: [
        "pendente",
        "processando",
        "aprovado",
        "recusado",
        "estornado",
      ],
      tipo_transmissao: ["manual", "automatico", "ambos"],
    },
  },
} as const

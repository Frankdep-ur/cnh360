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
          modo_transicao: string | null
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
          modo_transicao?: string | null
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
          modo_transicao?: string | null
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
          aluno_confirmou_chegada: boolean | null
          aluno_id: string
          aluno_pronto_para_aula: boolean | null
          aula_fim: string | null
          aula_inicio: string | null
          codigo_validacao: string | null
          created_at: string
          data_hora: string
          duracao_minutos: number
          id: string
          instrutor_a_caminho: boolean | null
          instrutor_chegou: boolean | null
          instrutor_id: string
          latitude_aluno: number | null
          latitude_encontro: number | null
          longitude_aluno: number | null
          longitude_encontro: number | null
          observacoes: string | null
          payment_confirmed: boolean | null
          ponto_encontro: string | null
          qr_code_data: string | null
          qr_code_expires_at: string | null
          qr_code_inicio_data: string | null
          qr_code_inicio_expires_at: string | null
          qr_inicio_validado: boolean | null
          qr_validado: boolean | null
          status: Database["public"]["Enums"]["status_aula"]
          transaction_id: string | null
          updated_at: string
          usa_carro_aluno: boolean | null
          validada_em: string | null
          valor: number
          veiculo_id: string | null
        }
        Insert: {
          aluno_confirmou_chegada?: boolean | null
          aluno_id: string
          aluno_pronto_para_aula?: boolean | null
          aula_fim?: string | null
          aula_inicio?: string | null
          codigo_validacao?: string | null
          created_at?: string
          data_hora: string
          duracao_minutos?: number
          id?: string
          instrutor_a_caminho?: boolean | null
          instrutor_chegou?: boolean | null
          instrutor_id: string
          latitude_aluno?: number | null
          latitude_encontro?: number | null
          longitude_aluno?: number | null
          longitude_encontro?: number | null
          observacoes?: string | null
          payment_confirmed?: boolean | null
          ponto_encontro?: string | null
          qr_code_data?: string | null
          qr_code_expires_at?: string | null
          qr_code_inicio_data?: string | null
          qr_code_inicio_expires_at?: string | null
          qr_inicio_validado?: boolean | null
          qr_validado?: boolean | null
          status?: Database["public"]["Enums"]["status_aula"]
          transaction_id?: string | null
          updated_at?: string
          usa_carro_aluno?: boolean | null
          validada_em?: string | null
          valor: number
          veiculo_id?: string | null
        }
        Update: {
          aluno_confirmou_chegada?: boolean | null
          aluno_id?: string
          aluno_pronto_para_aula?: boolean | null
          aula_fim?: string | null
          aula_inicio?: string | null
          codigo_validacao?: string | null
          created_at?: string
          data_hora?: string
          duracao_minutos?: number
          id?: string
          instrutor_a_caminho?: boolean | null
          instrutor_chegou?: boolean | null
          instrutor_id?: string
          latitude_aluno?: number | null
          latitude_encontro?: number | null
          longitude_aluno?: number | null
          longitude_encontro?: number | null
          observacoes?: string | null
          payment_confirmed?: boolean | null
          ponto_encontro?: string | null
          qr_code_data?: string | null
          qr_code_expires_at?: string | null
          qr_code_inicio_data?: string | null
          qr_code_inicio_expires_at?: string | null
          qr_inicio_validado?: boolean | null
          qr_validado?: boolean | null
          status?: Database["public"]["Enums"]["status_aula"]
          transaction_id?: string | null
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
            foreignKeyName: "aulas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos_seguros"
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
            foreignKeyName: "aulas_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores_seguros"
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
      aulas_auditoria: {
        Row: {
          aula_id: string
          created_at: string
          dados_adicionais: Json | null
          device_info: Json | null
          evento: string
          id: string
          latitude: number | null
          longitude: number | null
          precisao_metros: number | null
          timestamp: string
          user_id: string
        }
        Insert: {
          aula_id: string
          created_at?: string
          dados_adicionais?: Json | null
          device_info?: Json | null
          evento: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          precisao_metros?: number | null
          timestamp?: string
          user_id: string
        }
        Update: {
          aula_id?: string
          created_at?: string
          dados_adicionais?: Json | null
          device_info?: Json | null
          evento?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          precisao_metros?: number | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_auditoria_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
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
            foreignKeyName: "avaliacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos_seguros"
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
          {
            foreignKeyName: "avaliacoes_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores_seguros"
            referencedColumns: ["id"]
          },
        ]
      }
      curso_aulas: {
        Row: {
          ativo: boolean
          conteudo_texto: string
          created_at: string
          duracao_minutos: number
          id: string
          modulo_id: string
          ordem: number
          titulo: string
          video_fonte: string | null
          video_url: string | null
        }
        Insert: {
          ativo?: boolean
          conteudo_texto: string
          created_at?: string
          duracao_minutos?: number
          id?: string
          modulo_id: string
          ordem: number
          titulo: string
          video_fonte?: string | null
          video_url?: string | null
        }
        Update: {
          ativo?: boolean
          conteudo_texto?: string
          created_at?: string
          duracao_minutos?: number
          id?: string
          modulo_id?: string
          ordem?: number
          titulo?: string
          video_fonte?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curso_aulas_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "curso_modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      curso_modulos: {
        Row: {
          ativo: boolean
          cor: string
          created_at: string
          descricao: string | null
          duracao_estimada_minutos: number
          icone: string
          id: string
          ordem: number
          titulo: string
        }
        Insert: {
          ativo?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          duracao_estimada_minutos?: number
          icone?: string
          id?: string
          ordem: number
          titulo: string
        }
        Update: {
          ativo?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          duracao_estimada_minutos?: number
          icone?: string
          id?: string
          ordem?: number
          titulo?: string
        }
        Relationships: []
      }
      curso_quiz_perguntas: {
        Row: {
          aula_id: string
          created_at: string
          explicacao: string | null
          id: string
          opcoes: Json
          ordem: number
          pergunta: string
          resposta_correta: string
        }
        Insert: {
          aula_id: string
          created_at?: string
          explicacao?: string | null
          id?: string
          opcoes: Json
          ordem: number
          pergunta: string
          resposta_correta: string
        }
        Update: {
          aula_id?: string
          created_at?: string
          explicacao?: string | null
          id?: string
          opcoes?: Json
          ordem?: number
          pergunta?: string
          resposta_correta?: string
        }
        Relationships: [
          {
            foreignKeyName: "curso_quiz_perguntas_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "curso_aulas"
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
          {
            foreignKeyName: "disponibilidade_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores_seguros"
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
          is_mei_autonomo: boolean | null
          kyc_base64: string | null
          kyc_link_expires_at: string | null
          kyc_status: string | null
          kyc_updated_at: string | null
          kyc_url: string | null
          mei_cnpj: string | null
          nota_media: number | null
          pagarme_recipient_id: string | null
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
          is_mei_autonomo?: boolean | null
          kyc_base64?: string | null
          kyc_link_expires_at?: string | null
          kyc_status?: string | null
          kyc_updated_at?: string | null
          kyc_url?: string | null
          mei_cnpj?: string | null
          nota_media?: number | null
          pagarme_recipient_id?: string | null
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
          is_mei_autonomo?: boolean | null
          kyc_base64?: string | null
          kyc_link_expires_at?: string | null
          kyc_status?: string | null
          kyc_updated_at?: string | null
          kyc_url?: string | null
          mei_cnpj?: string | null
          nota_media?: number | null
          pagarme_recipient_id?: string | null
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
          {
            foreignKeyName: "instrutores_autoescola_id_fkey"
            columns: ["autoescola_id"]
            isOneToOne: false
            referencedRelation: "autoescolas_seguros"
            referencedColumns: ["id"]
          },
        ]
      }
      instrutores_publico_cache: {
        Row: {
          ativo: boolean | null
          bio: string | null
          cnh_categoria: Database["public"]["Enums"]["categoria_cnh"] | null
          foto: string | null
          id: string
          nome: string | null
          nota_media: number | null
          preco_hora: number | null
          raio_atendimento_km: number | null
          total_aulas: number | null
          total_avaliacoes: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          bio?: string | null
          cnh_categoria?: Database["public"]["Enums"]["categoria_cnh"] | null
          foto?: string | null
          id: string
          nome?: string | null
          nota_media?: number | null
          preco_hora?: number | null
          raio_atendimento_km?: number | null
          total_aulas?: number | null
          total_avaliacoes?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          bio?: string | null
          cnh_categoria?: Database["public"]["Enums"]["categoria_cnh"] | null
          foto?: string | null
          id?: string
          nome?: string | null
          nota_media?: number | null
          preco_hora?: number | null
          raio_atendimento_km?: number | null
          total_aulas?: number | null
          total_avaliacoes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      localizacao_tempo_real: {
        Row: {
          accuracy: number | null
          aula_id: string | null
          created_at: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          speed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          aula_id?: string | null
          created_at?: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          speed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          aula_id?: string | null
          created_at?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          speed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "localizacao_tempo_real_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
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
          {
            foreignKeyName: "logs_renach_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos_seguros"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_aula: {
        Row: {
          aula_id: string
          content: string
          created_at: string
          id: string
          is_system: boolean | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          aula_id: string
          content: string
          created_at?: string
          id?: string
          is_system?: boolean | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          aula_id?: string
          content?: string
          created_at?: string
          id?: string
          is_system?: boolean | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_aula_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          id: string
          read: boolean
          reference_id: string | null
          sent_at: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          id?: string
          read?: boolean
          reference_id?: string | null
          sent_at?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          id?: string
          read?: boolean
          reference_id?: string | null
          sent_at?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          aluno_id: string
          aula_id: string | null
          created_at: string
          external_id: string | null
          id: string
          instrutor_id: string | null
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
          instrutor_id?: string | null
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
          instrutor_id?: string | null
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
            foreignKeyName: "pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos_seguros"
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
          {
            foreignKeyName: "pagamentos_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores_seguros"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          estado: string | null
          full_name: string | null
          id: string
          is_test_account: boolean | null
          modo_transicao: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          estado?: string | null
          full_name?: string | null
          id: string
          is_test_account?: boolean | null
          modo_transicao?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          estado?: string | null
          full_name?: string | null
          id?: string
          is_test_account?: boolean | null
          modo_transicao?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      progresso_aulas: {
        Row: {
          aluno_id: string
          aula_id: string
          concluida_em: string | null
          created_at: string
          id: string
          iniciada_em: string
          quiz_aprovado: boolean | null
          quiz_nota: number | null
          tempo_visualizado_segundos: number
          tentativas_quiz: number
          updated_at: string
        }
        Insert: {
          aluno_id: string
          aula_id: string
          concluida_em?: string | null
          created_at?: string
          id?: string
          iniciada_em?: string
          quiz_aprovado?: boolean | null
          quiz_nota?: number | null
          tempo_visualizado_segundos?: number
          tentativas_quiz?: number
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          aula_id?: string
          concluida_em?: string | null
          created_at?: string
          id?: string
          iniciada_em?: string
          quiz_aprovado?: boolean | null
          quiz_nota?: number | null
          tempo_visualizado_segundos?: number
          tentativas_quiz?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_aulas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_aulas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos_seguros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_aulas_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "curso_aulas"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_renach: {
        Row: {
          aluno_id: string
          aulas_praticas_conclusao: string | null
          aulas_praticas_inicio: string | null
          certificado_teorico_enviado_em: string | null
          certificado_teorico_url: string | null
          cnh_emitida_em: string | null
          created_at: string
          curso_teorico_conclusao: string | null
          curso_teorico_inicio: string | null
          etapa_atual: string
          exame_medico_concluido: boolean | null
          exame_pratico_data: string | null
          exame_pratico_resultado: string | null
          exame_teorico_data: string | null
          exame_teorico_resultado: string | null
          id: string
          prova_teorica_detran_aprovada: boolean | null
          updated_at: string
        }
        Insert: {
          aluno_id: string
          aulas_praticas_conclusao?: string | null
          aulas_praticas_inicio?: string | null
          certificado_teorico_enviado_em?: string | null
          certificado_teorico_url?: string | null
          cnh_emitida_em?: string | null
          created_at?: string
          curso_teorico_conclusao?: string | null
          curso_teorico_inicio?: string | null
          etapa_atual?: string
          exame_medico_concluido?: boolean | null
          exame_pratico_data?: string | null
          exame_pratico_resultado?: string | null
          exame_teorico_data?: string | null
          exame_teorico_resultado?: string | null
          id?: string
          prova_teorica_detran_aprovada?: boolean | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          aulas_praticas_conclusao?: string | null
          aulas_praticas_inicio?: string | null
          certificado_teorico_enviado_em?: string | null
          certificado_teorico_url?: string | null
          cnh_emitida_em?: string | null
          created_at?: string
          curso_teorico_conclusao?: string | null
          curso_teorico_inicio?: string | null
          etapa_atual?: string
          exame_medico_concluido?: boolean | null
          exame_pratico_data?: string | null
          exame_pratico_resultado?: string | null
          exame_teorico_data?: string | null
          exame_teorico_resultado?: string | null
          id?: string
          prova_teorica_detran_aprovada?: boolean | null
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
          {
            foreignKeyName: "progresso_renach_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: true
            referencedRelation: "alunos_seguros"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      simulados_historico: {
        Row: {
          acertos: number
          aluno_id: string
          aprovado: boolean
          created_at: string
          detalhes_categorias: Json | null
          id: string
          nota: number
          tempo_gasto_segundos: number
          total_questoes: number
        }
        Insert: {
          acertos: number
          aluno_id: string
          aprovado: boolean
          created_at?: string
          detalhes_categorias?: Json | null
          id?: string
          nota: number
          tempo_gasto_segundos: number
          total_questoes?: number
        }
        Update: {
          acertos?: number
          aluno_id?: string
          aprovado?: boolean
          created_at?: string
          detalhes_categorias?: Json | null
          id?: string
          nota?: number
          tempo_gasto_segundos?: number
          total_questoes?: number
        }
        Relationships: [
          {
            foreignKeyName: "simulados_historico_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulados_historico_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos_seguros"
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
          {
            foreignKeyName: "veiculos_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores_seguros"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      alunos_seguros: {
        Row: {
          avatar_url: string | null
          categoria_pretendida:
            | Database["public"]["Enums"]["categoria_cnh"]
            | null
          exame_pratico_aprovado: boolean | null
          exame_teorico_aprovado: boolean | null
          full_name: string | null
          horas_praticas_completadas: number | null
          horas_praticas_total: number | null
          id: string | null
          objetivo: Database["public"]["Enums"]["objetivo_aluno"] | null
          phone: string | null
          possui_carro_proprio: boolean | null
          user_id: string | null
        }
        Relationships: []
      }
      autoescolas_seguros: {
        Row: {
          ativa: boolean | null
          cidade: string | null
          email: string | null
          estado: string | null
          id: string | null
          nome_fantasia: string | null
          telefone: string | null
        }
        Insert: {
          ativa?: boolean | null
          cidade?: string | null
          email?: string | null
          estado?: string | null
          id?: string | null
          nome_fantasia?: string | null
          telefone?: string | null
        }
        Update: {
          ativa?: boolean | null
          cidade?: string | null
          email?: string | null
          estado?: string | null
          id?: string | null
          nome_fantasia?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      instrutores_seguros: {
        Row: {
          ativo: boolean | null
          autoescola_id: string | null
          avatar_url: string | null
          bio: string | null
          cnh_categoria: Database["public"]["Enums"]["categoria_cnh"] | null
          full_name: string | null
          id: string | null
          is_mei_autonomo: boolean | null
          nota_media: number | null
          preco_hora: number | null
          raio_atendimento_km: number | null
          total_aulas: number | null
          total_avaliacoes: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instrutores_autoescola_id_fkey"
            columns: ["autoescola_id"]
            isOneToOne: false
            referencedRelation: "autoescolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instrutores_autoescola_id_fkey"
            columns: ["autoescola_id"]
            isOneToOne: false
            referencedRelation: "autoescolas_seguros"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos_seguros: {
        Row: {
          aluno_id: string | null
          aula_id: string | null
          created_at: string | null
          id: string | null
          instrutor_id: string | null
          metodo: Database["public"]["Enums"]["metodo_pagamento"] | null
          pago_em: string | null
          status: Database["public"]["Enums"]["status_pagamento"] | null
          taxa_plataforma: number | null
          updated_at: string | null
          valor_bruto: number | null
          valor_instrutor: number | null
        }
        Insert: {
          aluno_id?: string | null
          aula_id?: string | null
          created_at?: string | null
          id?: string | null
          instrutor_id?: string | null
          metodo?: Database["public"]["Enums"]["metodo_pagamento"] | null
          pago_em?: string | null
          status?: Database["public"]["Enums"]["status_pagamento"] | null
          taxa_plataforma?: number | null
          updated_at?: string | null
          valor_bruto?: number | null
          valor_instrutor?: number | null
        }
        Update: {
          aluno_id?: string | null
          aula_id?: string | null
          created_at?: string | null
          id?: string | null
          instrutor_id?: string | null
          metodo?: Database["public"]["Enums"]["metodo_pagamento"] | null
          pago_em?: string | null
          status?: Database["public"]["Enums"]["status_pagamento"] | null
          taxa_plataforma?: number | null
          updated_at?: string | null
          valor_bruto?: number | null
          valor_instrutor?: number | null
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
            foreignKeyName: "pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos_seguros"
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
          {
            foreignKeyName: "pagamentos_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "instrutores_seguros"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_old_locations: { Args: never; Returns: undefined }
      get_participant_name: { Args: { p_user_id: string }; Returns: string }
      get_public_autoescolas: {
        Args: never
        Returns: {
          cidade: string
          estado: string
          id: string
          nome_fantasia: string
        }[]
      }
      get_public_instructors: {
        Args: never
        Returns: {
          bio: string
          cnh_categoria: Database["public"]["Enums"]["categoria_cnh"]
          id: string
          nota_media: number
          preco_hora: number
          total_avaliacoes: number
        }[]
      }
      get_user_aluno_id: { Args: { user_uuid: string }; Returns: string }
      get_user_instrutor_id: { Args: { user_uuid: string }; Returns: string }
      get_vehicle_display_info: {
        Args: { p_instrutor_id: string }
        Returns: {
          ano: number
          categoria: Database["public"]["Enums"]["categoria_cnh"]
          id: string
          modelo: string
          transmissao: Database["public"]["Enums"]["tipo_transmissao"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      instructor_can_view_student: {
        Args: { _aluno_id: string }
        Returns: boolean
      }
      is_instructor_owner: { Args: { _instrutor_id: string }; Returns: boolean }
      is_student_owner: { Args: { _aluno_id: string }; Returns: boolean }
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
        | "em_rota"
        | "aguardando_confirmacao"
        | "aguardando_qr"
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
        "em_rota",
        "aguardando_confirmacao",
        "aguardando_qr",
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

// Dados estáticos para UI - conteúdo real vem do banco de dados
import { Scale, Shield, Heart, Leaf, Wrench, LucideIcon } from 'lucide-react';

export interface ModuloInfo {
  id: number;
  titulo: string;
  descricao: string;
  icone: LucideIcon;
  cor: string;
  totalAulas: number;
  duracaoEstimada: string;
}

export const MODULOS_INFO: ModuloInfo[] = [
  {
    id: 1,
    titulo: 'Legislação de Trânsito',
    descricao: 'CTB, SNT, sinalização, infrações e penalidades',
    icone: Scale,
    cor: '#00c853',
    totalAulas: 12,
    duracaoEstimada: '2h30'
  },
  {
    id: 2,
    titulo: 'Direção Defensiva',
    descricao: 'Condução segura, condições adversas, prevenção',
    icone: Shield,
    cor: '#2196f3',
    totalAulas: 10,
    duracaoEstimada: '2h'
  },
  {
    id: 3,
    titulo: 'Primeiros Socorros',
    descricao: 'Emergências, sinalização, socorro às vítimas',
    icone: Heart,
    cor: '#f44336',
    totalAulas: 8,
    duracaoEstimada: '1h30'
  },
  {
    id: 4,
    titulo: 'Meio Ambiente e Cidadania',
    descricao: 'Poluição, cidadania, relações interpessoais',
    icone: Leaf,
    cor: '#4caf50',
    totalAulas: 6,
    duracaoEstimada: '1h'
  },
  {
    id: 5,
    titulo: 'Mecânica Básica',
    descricao: 'Motor, freios, suspensão, manutenção',
    icone: Wrench,
    cor: '#ff9800',
    totalAulas: 5,
    duracaoEstimada: '45min'
  }
];

export const TOTAL_AULAS = 41;
export const NOTA_MINIMA_APROVACAO = 70;

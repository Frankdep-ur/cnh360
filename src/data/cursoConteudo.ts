// Dados estáticos para UI - conteúdo real vem do banco de dados
import { Scale, Shield, Heart, Leaf, Wrench, TrafficCone, AlertTriangle, LucideIcon } from 'lucide-react';

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
    totalAulas: 20,
    duracaoEstimada: '3h20'
  },
  {
    id: 2,
    titulo: 'Direção Defensiva',
    descricao: 'Condução segura, condições adversas, prevenção',
    icone: Shield,
    cor: '#2196f3',
    totalAulas: 15,
    duracaoEstimada: '3h'
  },
  {
    id: 3,
    titulo: 'Primeiros Socorros',
    descricao: 'Emergências, sinalização, socorro às vítimas',
    icone: Heart,
    cor: '#f44336',
    totalAulas: 12,
    duracaoEstimada: '2h27'
  },
  {
    id: 4,
    titulo: 'Meio Ambiente e Cidadania',
    descricao: 'Poluição, cidadania, relações interpessoais',
    icone: Leaf,
    cor: '#4caf50',
    totalAulas: 12,
    duracaoEstimada: '2h12'
  },
  {
    id: 5,
    titulo: 'Mecânica Básica',
    descricao: 'Motor, freios, suspensão, manutenção',
    icone: Wrench,
    cor: '#ff9800',
    totalAulas: 11,
    duracaoEstimada: '2h14'
  },
  {
    id: 6,
    titulo: 'Sinalização Avançada',
    descricao: 'Placas especiais, obras, dispositivos e interpretação',
    icone: TrafficCone,
    cor: '#9c27b0',
    totalAulas: 8,
    duracaoEstimada: '1h36'
  },
  {
    id: 7,
    titulo: 'Situações Especiais de Direção',
    descricao: 'Condições adversas, rotatórias, reboque e carga',
    icone: AlertTriangle,
    cor: '#607d8b',
    totalAulas: 6,
    duracaoEstimada: '1h12'
  }
];

export const TOTAL_AULAS = 84;
export const NOTA_MINIMA_APROVACAO = 70;

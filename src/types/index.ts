export interface SalaryConfig {
  salario: number;
  diaRecebimento: number;
}

export type Salary = SalaryConfig;

export interface Aggregates {
  salario: number;
  totalExpenses: number;
  paidExpenses: number;
  unpaidExpenses: number;
  totalAportes: number;
  totalSaved: number;
  remainingAvailable: number;
}

export interface Expense {
  id: string;
  descricao: string;
  valor: number;
  categoria: 'Moradia' | 'Alimentação' | 'Transporte' | 'Lazer' | 'Saúde' | 'Educação' | 'Outros';
  vencimento: number; // dia do mês (1-31)
  pago: boolean;
  tipo: 'Recorrente' | 'Única' | 'Parcelada';
  parcelasTotais?: number; // ex: 12
  parcelaAtual?: number; // ex: 1
}

export interface Caixinha {
  id: string;
  nome: string;
  valorAtual: number;
  aporteMensal: number;
  rendimentoCdiPct: number; // ex: 100 (% do CDI)
}

export interface Goal {
  id: string;
  nome: string;
  valorObjetivo: number;
  dataAlvo: string; // formato YYYY-MM
  caixinhaVinculadaId: string; // ID da Caixinha vinculada para cálculo automático
  caixinhaVinculadaIds?: string[]; // IDs de múltiplas caixinhas vinculadas
  aporteSalarioDireto?: number; // aporte adicional direto do salário do usuário
  descricao?: string;
}

export interface VestData {
  salary: SalaryConfig;
  expenses: Expense[];
  caixinhas: Caixinha[];
  goals: Goal[];
  history?: MonthHistory[];
}

export interface MonthHistory {
  id: string;
  mesAno: string;
  receitas: number;
  despesasTotais: number;
  despesasPagas: number;
  investido: number;
  rendimentoCaixinhas: number;
  sobra: number;
  despesasDetalhadas: Expense[];
}

export interface MonthlyProjection {
  mesAno: string; // ex: "06/2026"
  receitas: number;
  despesas: number;
  investimentoAporte: number;
  rendimentoAcumulado: number;
  saldoCaixinhasTotal: number;
  saldosDetalhados: { [caixinhaId: string]: number };
}

export interface Operadora {
  idOperadora: number;
  nmOperadora: string;
}


import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  PiggyBank,
  Target,
  Sparkles,
  PieChart,
  CalendarDays,
  ChevronRight
} from 'lucide-react';
import { useVest } from '../hooks/useVest';
import { formatarData } from '../utils/formatters';
import { Expense, Caixinha, Goal } from '../types';

// Sub-components
import { SalarySection } from '../components/SalarySection';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { CaixinhaForm } from '../components/CaixinhaForm';
import { CaixinhaCard } from '../components/CaixinhaCard';
import { GoalForm } from '../components/GoalForm';
import { GoalCard } from '../components/GoalCard';
import { ProjectionsSection } from '../components/ProjectionsSection';

export const VestDashboard: React.FC = () => {
  const {
    salary,
    expenses,
    caixinhas,
    goals,
    aggregates,
    projections,
    goalPredictions,
    updateSalary,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleExpensePaid,
    addCaixinha,
    updateCaixinha,
    deleteCaixinha,
    addGoal,
    updateGoal,
    deleteGoal,
    resetToDefault,
  } = useVest();

  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'caixinhas' | 'goals' | 'projections'>('overview');

  // --- Estados de Formulários e Edições ---
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCaixinha, setShowAddCaixinha] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCaixinha, setEditingCaixinha] = useState<Caixinha | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [projectionMonths, setProjectionMonths] = useState<number>(12);

  // Formatar Moeda Real BR
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // --- Submissões de Formulários ---
  const handleExpenseSubmit = (data: {
    descricao: string;
    valor: number;
    categoria: Expense['categoria'];
    vencimento: number;
    tipo: Expense['tipo'];
    parcelasTotais?: number;
    parcelaAtual?: number;
  }) => {
    if (editingExpense) {
      updateExpense({
        ...editingExpense,
        ...data,
      });
      setEditingExpense(null);
    } else {
      addExpense({
        ...data,
        pago: false,
      });
    }
    setShowAddExpense(false);
  };

  const handleCaixinhaSubmit = (data: {
    nome: string;
    valorAtual: number;
    aporteMensal: number;
    rendimentoCdiPct: number;
  }) => {
    if (editingCaixinha) {
      updateCaixinha({
        ...editingCaixinha,
        ...data,
      });
      setEditingCaixinha(null);
    } else {
      addCaixinha(data);
    }
    setShowAddCaixinha(false);
  };

  const handleGoalSubmit = (data: {
    nome: string;
    valorObjetivo: number;
    dataAlvo: string;
    caixinhaVinculadaIds: string[];
    aporteSalarioDireto: number;
    descricao?: string;
  }) => {
    if (editingGoal) {
      updateGoal({
        ...editingGoal,
        ...data,
        caixinhaVinculadaId: data.caixinhaVinculadaIds[0] || '',
      });
      setEditingGoal(null);
    } else {
      addGoal({
        ...data,
        caixinhaVinculadaId: data.caixinhaVinculadaIds[0] || '',
      });
    }
    setShowAddGoal(false);
  };

  const handleOptimizeAporte = (caixinhaId: string, requiredAporte: number) => {
    const cx = caixinhas.find(c => c.id === caixinhaId);
    if (cx) {
      updateCaixinha({
        ...cx,
        aporteMensal: Math.ceil(requiredAporte),
      });
    }
  };

  // --- Helpers de Edição ---
  const startEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setShowAddExpense(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditCaixinha = (cx: Caixinha) => {
    setEditingCaixinha(cx);
    setShowAddCaixinha(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditGoal = (g: Goal) => {
    setEditingGoal(g);
    setShowAddGoal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-24 sm:pb-0">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <TrendingUp className="text-white h-5 w-5" />
          </div>
          <span className="font-black text-white text-base tracking-tight uppercase">vest</span>
        </div>

        {/* Navigation - Tabs Desktop */}
        <nav className="hidden sm:flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <PieChart className="h-4 w-4" /> Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'expenses' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <TrendingDown className="h-4 w-4" /> Despesas
          </button>
          <button
            onClick={() => setActiveTab('caixinhas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'caixinhas' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <PiggyBank className="h-4 w-4" /> Caixinhas
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'goals' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Target className="h-4 w-4" /> Metas
          </button>
          <button
            onClick={() => setActiveTab('projections')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'projections' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <CalendarDays className="h-4 w-4" /> Previsões
          </button>
        </nav>

        {/* Clear Data Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefault}
            title="Limpar todos os dados"
            className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 transition"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Navigation - Fixed Bottom Bar for Mobile */}
      <nav className="flex sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 justify-around items-center py-2 px-1 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${activeTab === 'overview' ? 'text-indigo-400 font-extrabold scale-105' : 'text-slate-400'}`}
        >
          <PieChart className="h-5 w-5" />
          <span className="text-[9px] font-medium">Visão Geral</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${activeTab === 'expenses' ? 'text-indigo-400 font-extrabold scale-105' : 'text-slate-400'}`}
        >
          <TrendingDown className="h-5 w-5" />
          <span className="text-[9px] font-medium">Despesas</span>
        </button>
        <button
          onClick={() => setActiveTab('caixinhas')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${activeTab === 'caixinhas' ? 'text-indigo-400 font-extrabold scale-105' : 'text-slate-400'}`}
        >
          <PiggyBank className="h-5 w-5" />
          <span className="text-[9px] font-medium">Caixinhas</span>
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${activeTab === 'goals' ? 'text-indigo-400 font-extrabold scale-105' : 'text-slate-400'}`}
        >
          <Target className="h-5 w-5" />
          <span className="text-[9px] font-medium">Metas</span>
        </button>
        <button
          onClick={() => setActiveTab('projections')}
          className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${activeTab === 'projections' ? 'text-indigo-400 font-extrabold scale-105' : 'text-slate-400'}`}
        >
          <CalendarDays className="h-5 w-5" />
          <span className="text-[9px] font-medium">Previsões</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8">

        {/* Salary Widget Section */}
        <SalarySection
          salary={salary}
          aggregates={aggregates}
          updateSalary={updateSalary}
          formatBRL={formatBRL}
        />

        {/* ==================== TAB: OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

            {/* Esquerda / Métricas principais */}
            <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                    <PiggyBank className="h-16 w-16 text-white" />
                  </div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Patrimônio Guardado</div>
                  <div className="text-xl md:text-2xl font-black text-white mt-1">{formatBRL(aggregates.totalSaved)}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Rendendo todo mês
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                    <TrendingDown className="h-16 w-16 text-white" />
                  </div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Gastos do Mês</div>
                  <div className="text-xl md:text-2xl font-black text-white mt-1">{formatBRL(aggregates.totalExpenses)}</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-1.5">
                    {expenses.length} contas cadastradas
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
                    <Target className="h-16 w-16 text-white" />
                  </div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Metas Ativas</div>
                  <div className="text-xl md:text-2xl font-black text-white mt-1">{goals.length}</div>
                  <div className="text-[10px] text-indigo-400 font-semibold mt-1.5">
                    {goalPredictions.filter(g => g.achievable).length} dentro do prazo
                  </div>
                </div>
              </div>

              {/* Mini gráfico SVG de Projeções futuras */}
              <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold text-white">Previsão de Crescimento do Patrimônio</h3>
                    <p className="text-xs text-slate-400">Aportes recorrentes + juros compostos em 36 meses</p>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-lg">36 meses</span>
                </div>

                {projections.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    <div className="h-44 md:h-52 w-full flex items-end justify-between gap-1.5 pt-6 relative px-1">
                      {/* Grid Lines */}
                      <div className="absolute left-0 right-0 top-1/4 border-t border-slate-800/40" />
                      <div className="absolute left-0 right-0 top-2/4 border-t border-slate-800/40" />
                      <div className="absolute left-0 right-0 top-3/4 border-t border-slate-800/40" />

                      {projections.filter((_, idx) => idx % 3 === 0 || idx === 35).map((p, idx) => {
                        const maxVal = projections[35]?.saldoCaixinhasTotal || 1;
                        const pctHeight = Math.max(8, (p.saldoCaixinhasTotal / maxVal) * 100);

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end relative z-10">
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full mb-2 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg shadow-xl text-[10px] opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap z-50">
                              <span className="font-extrabold text-white block">{p.mesAno}</span>
                              <span className="text-indigo-400 font-bold block">Saldo: {formatBRL(p.saldoCaixinhasTotal)}</span>
                              <span className="text-slate-400 block text-[9px]">Aportes: {formatBRL(p.investimentoAporte)}</span>
                            </div>

                            {/* Bar container */}
                            <div className="w-full bg-slate-850 rounded-lg overflow-hidden h-full flex items-end">
                              <div
                                className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-cyan-400 group-hover:brightness-110 transition rounded-t-md"
                                style={{ height: `${pctHeight}%` }}
                              />
                            </div>
                            <span className="text-[8px] font-bold text-slate-500 whitespace-nowrap mt-1 group-hover:text-indigo-400 transition">{p.mesAno}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">Crie caixinhas para simular o crescimento do seu patrimônio!</div>
                )}
              </div>
            </div>

            {/* Direita / Divisão do orçamento */}
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-5 shadow-xl">
                <div>
                  <h3 className="text-sm md:text-base font-extrabold text-white">Divisão de Orçamento</h3>
                  <p className="text-xs text-slate-400">Distribuição percentual do seu salário.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Despesas */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-300">
                      <span>Despesas do Mês ({Math.round((aggregates.totalExpenses / (salary.salario || 1)) * 100)}%)</span>
                      <span className="text-rose-400">{formatBRL(aggregates.totalExpenses)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${Math.min(100, (aggregates.totalExpenses / (salary.salario || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Caixinhas */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-300">
                      <span>Caixinhas ({Math.round((aggregates.totalAportes / (salary.salario || 1)) * 100)}%)</span>
                      <span className="text-indigo-400">{formatBRL(aggregates.totalAportes)}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, (aggregates.totalAportes / (salary.salario || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 mt-1 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Salário Total:</span>
                    <strong className="text-white font-extrabold">{formatBRL(salary.salario)}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Dia de Recebimento:</span>
                    <strong className="text-white font-extrabold">Todo dia {salary.diaRecebimento}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Livre p/ Gastar:</span>
                    <strong className={`font-black ${aggregates.remainingAvailable >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatBRL(aggregates.remainingAvailable)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Dica do dia */}
              <div className="bg-gradient-to-tr from-indigo-950/20 to-slate-900 border border-indigo-500/10 p-5 rounded-2xl shadow-xl flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                  <span className="text-xs font-black uppercase text-indigo-300 tracking-wider">Metodologia vest</span>
                </div>
                <p className="text-xs text-slate-300 leading-normal m-0">
                  O vest utiliza juros exponenciais compostos sob a taxa de referência Selic/CDI para programar o crescimento das caixinhas. Quanto mais cedo e com mais frequência você investir, maior será o efeito "bola de neve" dos juros sobre seu patrimônio.
                </p>
                <button
                  onClick={() => setActiveTab('caixinhas')}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition mt-1"
                >
                  Criar minha primeira Caixinha <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: EXPENSES ==================== */}
        {activeTab === 'expenses' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-white">Receitas e Despesas Mensais</h2>
                <p className="text-xs text-slate-400">Insira e gerencie seus custos mensais recorrentes.</p>
              </div>
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setShowAddExpense(!showAddExpense);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition self-start sm:self-center"
              >
                <Plus className="h-4 w-4" /> Cadastrar Novo Gasto
              </button>
            </div>

            {showAddExpense && (
              <ExpenseForm
                editingExpense={editingExpense}
                onSubmit={handleExpenseSubmit}
                onCancel={() => {
                  setShowAddExpense(false);
                  setEditingExpense(null);
                }}
              />
            )}

            {/* Listagem de Gastos */}
            <ExpenseList
              expenses={expenses}
              aggregates={aggregates}
              toggleExpensePaid={toggleExpensePaid}
              deleteExpense={deleteExpense}
              startEditExpense={startEditExpense}
              formatBRL={formatBRL}
              onShowAddExpense={() => {
                setEditingExpense(null);
                setShowAddExpense(true);
              }}
            />
          </div>
        )}

        {/* ==================== TAB: CAIXINHAS ==================== */}
        {activeTab === 'caixinhas' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-white">Minhas Caixinhas (Investimentos)</h2>
                <p className="text-xs text-slate-400">Guarde dinheiro mensalmente e aproveite os rendimentos exponenciais.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCaixinha(null);
                  setShowAddCaixinha(!showAddCaixinha);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition self-start sm:self-center"
              >
                <Plus className="h-4 w-4" /> Criar Nova Caixinha
              </button>
            </div>

            {showAddCaixinha && (
              <CaixinhaForm
                editingCaixinha={editingCaixinha}
                onSubmit={handleCaixinhaSubmit}
                onCancel={() => {
                  setShowAddCaixinha(false);
                  setEditingCaixinha(null);
                }}
              />
            )}

            {/* Listagem das Caixinhas */}
            {caixinhas.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
                <PiggyBank className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold">Nenhuma caixinha criada!</p>
                <p className="text-xs mb-4">Crie caixinhas com propósitos definidos para investir com rendimentos exponenciais compostos.</p>
                <button
                  onClick={() => {
                    setEditingCaixinha(null);
                    setShowAddCaixinha(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/15 inline-flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Criar Minha Primeira Caixinha
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {caixinhas.map((cx) => (
                  <CaixinhaCard
                    key={cx.id}
                    cx={cx}
                    onDelete={deleteCaixinha}
                    onEdit={startEditCaixinha}
                    formatBRL={formatBRL}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: GOALS ==================== */}
        {activeTab === 'goals' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-white">Objetivos e Metas Financeiras</h2>
                <p className="text-xs text-slate-400">Insira seus objetivos de vida e vincule-os a uma caixinha de aportes.</p>
              </div>
              <button
                onClick={() => {
                  setEditingGoal(null);
                  setShowAddGoal(!showAddGoal);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition self-start sm:self-center"
              >
                <Plus className="h-4 w-4" /> Adicionar Novo Objetivo
              </button>
            </div>

            {showAddGoal && (
              <GoalForm
                caixinhas={caixinhas}
                editingGoal={editingGoal}
                onSubmit={handleGoalSubmit}
                onCancel={() => {
                  setShowAddGoal(false);
                  setEditingGoal(null);
                }}
                formatBRL={formatBRL}
              />
            )}

            {/* Listagem das Metas */}
            {goalPredictions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
                <Target className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold">Nenhum objetivo ou meta financeira criada!</p>
                <p className="text-xs mb-4">Cadastre metas de curto, médio ou longo prazo para simular e planejar as datas exatas de conclusão.</p>
                <button
                  onClick={() => {
                    setEditingGoal(null);
                    setShowAddGoal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/15 inline-flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar Primeiro Objetivo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {goalPredictions.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    goals={goals}
                    onEdit={startEditGoal}
                    onDelete={deleteGoal}
                    onOptimize={handleOptimizeAporte}
                    formatBRL={formatBRL}
                    formatarData={formatarData}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: PROJECTIONS ==================== */}
        {activeTab === 'projections' && (
          <ProjectionsSection
            caixinhas={caixinhas}
            aggregates={aggregates}
            projections={projections}
            projectionMonths={projectionMonths}
            setProjectionMonths={setProjectionMonths}
            formatBRL={formatBRL}
            onNavigateToCaixinhas={() => setActiveTab('caixinhas')}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-auto">
        vest • Planejamento Financeiro Exponencial com Juros Compostos • © 2026
      </footer>
    </div>
  );
};

export default VestDashboard;

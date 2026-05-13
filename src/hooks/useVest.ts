import { useState, useEffect, useMemo } from 'react';
import { VestData, Expense, Caixinha, Goal, MonthlyProjection } from '../types';
import { VestService } from '../services/VestService';

export const useVest = () => {
  const [data, setData] = useState<VestData>(() => VestService.getFinancialData());

  // Salva no LocalStorage sempre que o estado sofrer mutação
  useEffect(() => {
    VestService.saveFinancialData(data);
  }, [data]);

  // --- Ações de Salário ---
  const updateSalary = (salario: number, diaRecebimento: number) => {
    setData((prev) => ({
      ...prev,
      salary: { salario, diaRecebimento },
    }));
  };

  // --- Ações de Despesas (Expenses) ---
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
    };
    setData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
    }));
  };

  const updateExpense = (updatedExpense: Expense) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp)),
    }));
  };

  const deleteExpense = (id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((exp) => exp.id !== id),
    }));
  };

  const toggleExpensePaid = (id: string) => {
    setData((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) =>
        exp.id === id ? { ...exp, pago: !exp.pago } : exp
      ),
    }));
  };

  // --- Ações de Caixinhas ---
  const addCaixinha = (caixinha: Omit<Caixinha, 'id'>) => {
    const newCaixinha: Caixinha = {
      ...caixinha,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
    };
    setData((prev) => ({
      ...prev,
      caixinhas: [...prev.caixinhas, newCaixinha],
    }));
  };

  const updateCaixinha = (updatedCaixinha: Caixinha) => {
    setData((prev) => ({
      ...prev,
      caixinhas: prev.caixinhas.map((cx) => (cx.id === updatedCaixinha.id ? updatedCaixinha : cx)),
    }));
  };

  const deleteCaixinha = (id: string) => {
    setData((prev) => ({
      ...prev,
      caixinhas: prev.caixinhas.filter((cx) => cx.id !== id),
      // Remove o vínculo das metas com a caixinha excluída (suporta ID único e array de IDs)
      goals: prev.goals.map((goal) => {
        const legacyMatch = goal.caixinhaVinculadaId === id;
        const updatedIds = goal.caixinhaVinculadaIds ? goal.caixinhaVinculadaIds.filter((cid: string) => cid !== id) : [];
        return {
          ...goal,
          caixinhaVinculadaId: legacyMatch ? '' : goal.caixinhaVinculadaId,
          caixinhaVinculadaIds: updatedIds,
        };
      }),
    }));
  };

  // --- Ações de Metas/Objetivos ---
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
    };
    setData((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  const updateGoal = (updatedGoal: Goal) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  // Reseta todos os dados para o padrão de demonstração
  const resetToDefault = () => {
    const freshData = VestService.resetData();
    setData(freshData);
  };

  // --- Cálculos de Resumo (Dashboard Aggregates) ---
  const aggregates = useMemo(() => {
    const salario = data.salary.salario;
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.valor, 0);
    const paidExpenses = data.expenses.reduce((sum, e) => (e.pago ? sum + e.valor : sum), 0);
    const unpaidExpenses = totalExpenses - paidExpenses;
    const totalAportes = data.caixinhas.reduce((sum, cx) => sum + cx.aporteMensal, 0);
    const totalSaved = data.caixinhas.reduce((sum, cx) => sum + cx.valorAtual, 0);
    const remainingAvailable = salario - totalAportes - unpaidExpenses;

    return {
      salario,
      totalExpenses,
      paidExpenses,
      unpaidExpenses,
      totalAportes,
      totalSaved,
      remainingAvailable,
    };
  }, [data]);

  // --- Projeções Financeiras Mensais (Fórmula de Juros Compostos + Aportes Recorrentes) ---
  const projections = useMemo((): MonthlyProjection[] => {
    const results: MonthlyProjection[] = [];
    const numMonths = 36; // Gerar previsões para os próximos 36 meses
    const currentDate = new Date();
    const CDI_ANUAL = 10.75; // Taxa Selic/CDI atual de ~10.75% ao ano

    // Inicializar saldos simulados para cada caixinha
    const simulatedBalances = data.caixinhas.reduce((acc, cx) => {
      acc[cx.id] = cx.valorAtual;
      return acc;
    }, {} as { [cxId: string]: number });

    for (let i = 1; i <= numMonths; i++) {
      const simDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const mesAnoStr = `${String(simDate.getMonth() + 1).padStart(2, '0')}/${simDate.getFullYear()}`;

      let rendimentoTotalMes = 0;
      let aporteTotalMes = 0;

      // Calcular o rendimento e somar o aporte de cada caixinha neste mês
      const saldosDetalhadosMes: { [cxId: string]: number } = {};

      data.caixinhas.forEach((cx) => {
        const saldoAnterior = simulatedBalances[cx.id] || 0;
        
        // Conversão exata de taxa anual (% do CDI) para taxa mensal de juros compostos:
        const cdiPct = cx.rendimentoCdiPct !== undefined && !isNaN(cx.rendimentoCdiPct) ? cx.rendimentoCdiPct : 100;
        const rendimentoAnualCdi = (cdiPct / 100) * (CDI_ANUAL / 100);
        const taxaRendimentoMensal = Math.pow(1 + rendimentoAnualCdi, 1 / 12) - 1;
        
        // Rendimento incide sobre o saldo atual antes do novo aporte
        const rendimento = saldoAnterior * taxaRendimentoMensal;
        const novoSaldo = saldoAnterior + rendimento + cx.aporteMensal;

        simulatedBalances[cx.id] = novoSaldo;
        saldosDetalhadosMes[cx.id] = novoSaldo;

        rendimentoTotalMes += rendimento;
        aporteTotalMes += cx.aporteMensal;
      });

      const saldoCaixinhasTotal = Object.values(simulatedBalances).reduce((sum, s) => sum + s, 0);

      // Calcular despesas simuladas para este mês futuro (mês de índice i)
      const despesasProjetadasMes = data.expenses.reduce((sum, e) => {
        if (e.tipo === 'Recorrente' || !e.tipo) {
          return sum + e.valor;
        }
        if (e.tipo === 'Parcelada' && e.parcelasTotais && e.parcelaAtual) {
          const parcelasRestantes = e.parcelasTotais - e.parcelaAtual;
          if (i <= parcelasRestantes) {
            return sum + e.valor;
          }
        }
        // Se e.tipo === 'Única', não entra nos meses futuros (já que ocorreu apenas no mês atual)
        return sum;
      }, 0);

      results.push({
        mesAno: mesAnoStr,
        receitas: data.salary.salario,
        despesas: despesasProjetadasMes,
        investimentoAporte: aporteTotalMes,
        rendimentoAcumulado: (results[results.length - 1]?.rendimentoAcumulado || 0) + rendimentoTotalMes,
        saldoCaixinhasTotal,
        saldosDetalhados: saldosDetalhadosMes,
      });
    }

    return results;
  }, [data]);

  // --- Análise Preditiva de Metas ---
  const goalPredictions = useMemo(() => {
    const CDI_ANUAL = 10.75; // Taxa Selic/CDI atual de ~10.75% ao ano

    return data.goals.map((goal) => {
      // 1. Encontrar todas as caixinhas vinculadas (suporta array múltiplo e fallback legada)
      const caixinhaIds = goal.caixinhaVinculadaIds || (goal.caixinhaVinculadaId ? [goal.caixinhaVinculadaId] : []);
      const linkedCaixinhas = data.caixinhas.filter((cx) => caixinhaIds.includes(cx.id));
      const directSalaryAporte = goal.aporteSalarioDireto || 0;

      // Nome das caixinhas vinculadas
      let linkedCaixinhaName = '';
      if (linkedCaixinhas.length > 0) {
        linkedCaixinhaName = linkedCaixinhas.map(cx => cx.nome).join(' + ');
        if (directSalaryAporte > 0) {
          linkedCaixinhaName += ` + Salário (${directSalaryAporte}/mês)`;
        }
      } else {
        linkedCaixinhaName = directSalaryAporte > 0 ? `Aporte Direto Salário (${directSalaryAporte}/mês)` : 'Nenhuma vinculada';
      }

      // Saldo acumulado atual de todas as caixinhas vinculadas
      const balanceCurrent = linkedCaixinhas.reduce((sum, cx) => sum + cx.valorAtual, 0);

      // Calcular meses necessários simulando passo a passo (pelo fato de termos múltiplas caixinhas com diferentes CDI)
      const simBalances: { [cxId: string]: number } = {};
      linkedCaixinhas.forEach((cx) => {
        simBalances[cx.id] = cx.valorAtual;
      });
      let directSalaryBalance = 0; // Acumulado do aporte direto

      let monthsNeeded = 0;
      const maxMonths = 120; // limite de 10 anos
      const target = goal.valorObjetivo;
      let tempTotalBalance = balanceCurrent;

      if (tempTotalBalance >= target) {
        monthsNeeded = 0;
      } else if (linkedCaixinhas.length === 0 && directSalaryAporte === 0) {
        monthsNeeded = Infinity;
      } else {
        while (tempTotalBalance < target && monthsNeeded < maxMonths) {
          monthsNeeded++;
          let currentMonthTotal = 0;

          // Rentabilizar cada caixinha individualmente
          linkedCaixinhas.forEach((cx) => {
            const cdiPct = cx.rendimentoCdiPct !== undefined && !isNaN(cx.rendimentoCdiPct) ? cx.rendimentoCdiPct : 100;
            const rendAnual = (cdiPct / 100) * (CDI_ANUAL / 100);
            const r_cx = Math.pow(1 + rendAnual, 1 / 12) - 1;
            
            const novoBal = (simBalances[cx.id] || 0) * (1 + r_cx) + cx.aporteMensal;
            simBalances[cx.id] = novoBal;
            currentMonthTotal += novoBal;
          });

          // Rentabilizar aporte direto (100% CDI)
          if (directSalaryAporte > 0) {
            const r_salary = Math.pow(1 + (CDI_ANUAL / 100), 1 / 12) - 1;
            directSalaryBalance = directSalaryBalance * (1 + r_salary) + directSalaryAporte;
            currentMonthTotal += directSalaryBalance;
          }

          tempTotalBalance = currentMonthTotal;
        }
      }

      // Calcular data prevista
      const currentDate = new Date();
      const reachedDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + (monthsNeeded === Infinity ? 0 : monthsNeeded), 1);
      const reachedDateStr = monthsNeeded === Infinity ? 'N/A' : `${String(reachedDate.getMonth() + 1).padStart(2, '0')}/${reachedDate.getFullYear()}`;

      // Verificar se atinge no prazo (dataAlvo está em formato YYYY-MM)
      const [alvoAno, alvoMes] = goal.dataAlvo.split('-').map(Number);
      const targetDate = new Date(alvoAno, alvoMes - 1, 1);
      
      const monthsToTarget = Math.max(
        1,
        (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + (targetDate.getMonth() - currentDate.getMonth())
      );

      const achievable = monthsNeeded <= monthsToTarget;

      // Calcular o aporte mensal EXTRA necessário para atingir o objetivo exatamente na data limite (com 100% do CDI)
      // Primeiro simula o acumulado que o usuário terá na data limite sem os aportes adicionais
      const simBalancesAtTarget: { [cxId: string]: number } = {};
      linkedCaixinhas.forEach((cx) => {
        simBalancesAtTarget[cx.id] = cx.valorAtual;
      });
      let directSalaryBalanceAtTarget = 0;

      for (let m = 1; m <= monthsToTarget; m++) {
        linkedCaixinhas.forEach((cx) => {
          const cdiPct = cx.rendimentoCdiPct !== undefined && !isNaN(cx.rendimentoCdiPct) ? cx.rendimentoCdiPct : 100;
          const rendAnual = (cdiPct / 100) * (CDI_ANUAL / 100);
          const r_cx = Math.pow(1 + rendAnual, 1 / 12) - 1;
          simBalancesAtTarget[cx.id] = (simBalancesAtTarget[cx.id] || 0) * (1 + r_cx) + cx.aporteMensal;
        });

        if (directSalaryAporte > 0) {
          const r_salary = Math.pow(1 + (CDI_ANUAL / 100), 1 / 12) - 1;
          directSalaryBalanceAtTarget = directSalaryBalanceAtTarget * (1 + r_salary) + directSalaryAporte;
        }
      }

      const totalProjectedAtTarget = Object.values(simBalancesAtTarget).reduce((sum, b) => sum + b, 0) + directSalaryBalanceAtTarget;

      let requiredAporte = 0;
      if (totalProjectedAtTarget >= target) {
        requiredAporte = 0;
      } else {
        const deficit = target - totalProjectedAtTarget;
        const r_salary = Math.pow(1 + (CDI_ANUAL / 100), 1 / 12) - 1;
        if (r_salary === 0) {
          requiredAporte = deficit / monthsToTarget;
        } else {
          const compoundFactor = Math.pow(1 + r_salary, monthsToTarget);
          const denominator = (compoundFactor - 1) / r_salary;
          requiredAporte = Math.max(0, deficit / denominator);
        }
      }

      return {
        ...goal,
        linkedCaixinhaName,
        monthsNeeded,
        monthsToTarget,
        achievable,
        reachedDateStr,
        requiredAporte,
        currentSavedForGoal: balanceCurrent,
      };
    });
  }, [data]);

  return {
    salary: data.salary,
    expenses: data.expenses,
    caixinhas: data.caixinhas,
    goals: data.goals,
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
  };
};
export default useVest;

import React from 'react';
import { TrendingDown, Check, X, Pencil, Trash2, Plus } from 'lucide-react';
import { Expense, Aggregates } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  aggregates: Aggregates;
  toggleExpensePaid: (id: string) => void;
  deleteExpense: (id: string) => void;
  startEditExpense: (exp: Expense) => void;
  formatBRL: (val: number) => string;
  onShowAddExpense: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  aggregates,
  toggleExpensePaid,
  deleteExpense,
  startEditExpense,
  formatBRL,
  onShowAddExpense,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 md:p-5 border-b border-slate-800/80 flex flex-row justify-between items-center gap-3">
        <span className="text-xs md:text-sm font-extrabold text-white">Todos os Gastos de Cada Mês</span>

        <div className="flex gap-2">
          <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.8 rounded">
            Pagos: {formatBRL(aggregates.paidExpenses)}
          </span>
          <span className="text-[9px] font-bold bg-rose-500/10 text-rose-400 px-2 py-0.8 rounded">
            A Pagar: {formatBRL(aggregates.unpaidExpenses)}
          </span>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <TrendingDown className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold">Nenhuma despesa cadastrada!</p>
          <p className="text-xs mb-4">Cadastre suas despesas para deduzir do seu orçamento mensal.</p>
          <button
            onClick={onShowAddExpense}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/15 inline-flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Cadastrar Primeira Despesa
          </button>
        </div>
      ) : (
        <>
          {/* Tabela para Desktop (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/20">
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Vencimento</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-950/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-sm">{exp.descricao}</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        exp.tipo === 'Parcelada'
                          ? 'bg-amber-500/10 text-amber-400'
                          : exp.tipo === 'Única'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {exp.tipo === 'Parcelada'
                          ? `Parcelado (${exp.parcelaAtual}/${exp.parcelasTotais})`
                          : exp.tipo === 'Única'
                          ? 'Único / Temporário'
                          : 'Mensal Recorrente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-300 text-sm">{formatBRL(exp.valor)}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-extrabold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                        {exp.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">Dia {exp.vencimento}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleExpensePaid(exp.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${exp.pago
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                          }`}
                      >
                        {exp.pago ? (
                          <>
                            <Check className="h-3.5 w-3.5" /> Pago
                          </>
                        ) : (
                          <>
                            <X className="h-3.5 w-3.5" /> Pendente
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => startEditExpense(exp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                          title="Editar despesa"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Excluir despesa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards de Despesas para Celulares (MD:HIDDEN) - Responsividade Perfeita */}
          <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
            {expenses.map((exp) => (
              <div key={exp.id} className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{exp.descricao}</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-[9px] font-extrabold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                        {exp.categoria}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        exp.tipo === 'Parcelada'
                          ? 'bg-amber-500/10 text-amber-400'
                          : exp.tipo === 'Única'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {exp.tipo === 'Parcelada'
                          ? `Parcelado (${exp.parcelaAtual}/${exp.parcelasTotais})`
                          : exp.tipo === 'Única'
                          ? 'Único'
                          : 'Recorrente'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-200">{formatBRL(exp.valor)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-bold text-slate-400">Vence todo dia {exp.vencimento}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpensePaid(exp.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${exp.pago
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                    >
                      {exp.pago ? 'Pago' : 'Pendente'}
                    </button>
                    <button
                      onClick={() => startEditExpense(exp)}
                      className="p-1 text-slate-400 hover:text-indigo-400"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

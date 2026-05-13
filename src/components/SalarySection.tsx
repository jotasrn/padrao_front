import React, { useState } from 'react';
import { DollarSign, Check, X, Sparkles } from 'lucide-react';
import { Salary, Aggregates } from '../types';

interface SalarySectionProps {
  salary: Salary;
  aggregates: Aggregates;
  updateSalary: (val: number, day: number) => void;
  formatBRL: (val: number) => string;
}

export const SalarySection: React.FC<SalarySectionProps> = ({
  salary,
  aggregates,
  updateSalary,
  formatBRL,
}) => {
  const [editingSalary, setEditingSalary] = useState(false);
  const [newSalaryVal, setNewSalaryVal] = useState(salary.salario.toString());
  const [newSalaryDay, setNewSalaryDay] = useState(salary.diaRecebimento.toString());

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    updateSalary(parseFloat(newSalaryVal) || 0, parseInt(newSalaryDay) || 5);
    setEditingSalary(false);
  };

  return (
    <>
      {/* Salary Widget */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-850 rounded-2xl border border-slate-800 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-5.5 w-5.5" />
          </div>
          {editingSalary ? (
            <form onSubmit={handleSaveSalary} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <div className="flex flex-col flex-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase mb-1">Salário Mensal (R$)</label>
                <input
                  type="number"
                  value={newSalaryVal}
                  onChange={(e) => setNewSalaryVal(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-semibold text-sm w-full sm:w-36 focus:outline-none focus:border-indigo-500"
                  placeholder="Valor"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] text-slate-400 font-bold uppercase mb-1">Dia Recebimento</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newSalaryDay}
                  onChange={(e) => setNewSalaryDay(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-semibold text-sm w-full sm:w-20 focus:outline-none focus:border-indigo-500"
                  placeholder="Dia"
                />
              </div>
              <div className="flex gap-2 mt-3 sm:mt-5 justify-end">
                <button type="submit" className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition flex-1 sm:flex-initial flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingSalary(false)} 
                  className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white transition flex-1 sm:flex-initial flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                Salário Mensal
                <button
                  onClick={() => {
                    setNewSalaryVal(salary.salario.toString());
                    setNewSalaryDay(salary.diaRecebimento.toString());
                    setEditingSalary(true);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 text-[10px] underline ml-1 font-semibold"
                >
                  Editar
                </button>
              </div>
              <div className="text-xl md:text-2xl font-black text-white flex items-baseline gap-1.5">
                {formatBRL(salary.salario)}
                <span className="text-xs font-semibold text-slate-400">todo dia {salary.diaRecebimento}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-row gap-3 w-full md:w-auto">
          <div className="bg-slate-950/40 border border-slate-800/80 px-3.5 py-2.5 rounded-xl flex-1 md:flex-initial">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Aportes Mensais</div>
            <div className="text-base font-extrabold text-indigo-400 mt-0.5">{formatBRL(aggregates.totalAportes)}</div>
          </div>
          <div className="bg-slate-950/40 border border-slate-800/80 px-3.5 py-2.5 rounded-xl flex-1 md:flex-initial">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
              <span>Livre p/ Gastar</span>
              <span className="text-[7.5px] text-slate-500 font-medium normal-case">(salário - aportes - despesas pendentes)</span>
            </div>
            <div className={`text-base font-extrabold mt-0.5 ${aggregates.remainingAvailable >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatBRL(aggregates.remainingAvailable)}
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding State for Empty Profiles */}
      {salary.salario === 0 && (
        <div className="bg-gradient-to-r from-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white m-0">👋 Bem-vindo ao vest!</h3>
              <p className="text-xs text-slate-300 leading-normal mt-0.5 m-0">
                Comece cadastrando seu <strong>Salário Mensal</strong> no botão acima para que possamos analisar seu orçamento e programar seus investimentos!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setNewSalaryVal(salary.salario.toString());
              setNewSalaryDay(salary.diaRecebimento.toString());
              setEditingSalary(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20 w-full sm:w-auto text-center shrink-0"
          >
            Definir Salário Agora
          </button>
        </div>
      )}
    </>
  );
};

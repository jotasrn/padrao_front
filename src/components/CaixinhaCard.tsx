import React from 'react';
import { PiggyBank, Pencil, Trash2 } from 'lucide-react';
import { Caixinha } from '../types';

interface CaixinhaCardProps {
  cx: Caixinha;
  onDelete: (id: string) => void;
  onEdit: (cx: Caixinha) => void;
  formatBRL: (val: number) => string;
}

export const CaixinhaCard: React.FC<CaixinhaCardProps> = ({
  cx,
  onDelete,
  onEdit,
  formatBRL,
}) => {
  const CDI_ANUAL = 10.75;
  const cdiPct = cx.rendimentoCdiPct !== undefined && !isNaN(cx.rendimentoCdiPct) ? cx.rendimentoCdiPct : 100;
  const rendimentoAnualCdi = (cdiPct / 100) * (CDI_ANUAL / 100);
  const r = Math.pow(1 + rendimentoAnualCdi, 1 / 12) - 1;

  // Simula o crescimento em 6 e 12 meses
  const balance6 = cx.valorAtual * Math.pow(1 + r, 6) + 
    cx.aporteMensal * ((Math.pow(1 + r, 6) - 1) / (r || 1));
    
  const balance12 = cx.valorAtual * Math.pow(1 + r, 12) + 
    cx.aporteMensal * ((Math.pow(1 + r, 12) - 1) / (r || 1));

  const actualAnnualPct = cdiPct * (CDI_ANUAL / 100);

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4 shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition">
        <PiggyBank className="h-16 w-16 text-white" />
      </div>

      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <h3 className="font-extrabold text-white text-base truncate pr-2">{cx.nome}</h3>
          <span className="text-[10px] font-bold text-indigo-400 block mt-0.5">
            Rende {cdiPct}% do CDI (~{actualAnnualPct.toFixed(2)}% a.a.)
          </span>
        </div>
        <div className="flex gap-1 items-center shrink-0">
          <button 
            onClick={() => onEdit(cx)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
            title="Editar caixinha"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button 
            onClick={() => onDelete(cx.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Excluir caixinha"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex justify-between gap-2">
        <div>
          <span className="text-[9px] text-slate-400 font-bold uppercase block">Acumulado</span>
          <strong className="text-base font-black text-white">{formatBRL(cx.valorAtual)}</strong>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-slate-400 font-bold uppercase block">Aporte Mensal</span>
          <strong className="text-base font-black text-emerald-400">{formatBRL(cx.aporteMensal)}</strong>
        </div>
      </div>

      <div className="mt-1 text-xs border-t border-slate-800/80 pt-3">
        <span className="text-[8px] text-slate-400 font-bold uppercase block mb-1.5">Simulação de Crescimento</span>
        
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Em 6 meses (com juros):</span>
            <span className="font-bold text-indigo-400">
              {formatBRL(balance6)}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Em 12 meses (com juros):</span>
            <span className="font-bold text-indigo-400">
              {formatBRL(balance12)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Pencil, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Goal } from '../types';

interface GoalCardProps {
  goal: any; // predicted compiled goal item
  goals: Goal[];
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
  onOptimize: (caixinhaId: string, requiredAporte: number) => void;
  formatBRL: (val: number) => string;
  formatarData: (val: string) => string;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  goals,
  onEdit,
  onDelete,
  onOptimize,
  formatBRL,
  formatarData,
}) => {
  const percentComplete = Math.min(100, Math.round((goal.currentSavedForGoal / goal.valorObjetivo) * 100 || 0));

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-white text-base truncate m-0">{goal.nome}</h3>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              goal.achievable 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {goal.achievable ? 'No Prazo' : 'Requer Ajuste'}
            </span>
          </div>
          {goal.descricao && <p className="text-xs text-slate-400 leading-normal mt-1 m-0">{goal.descricao}</p>}
          <span className="text-[10px] font-bold text-indigo-400 block mt-2">Caixinha vinculada: {goal.linkedCaixinhaName}</span>
        </div>
        <div className="flex gap-1 items-center shrink-0">
          <button
            onClick={() => {
              const originalGoal = goals.find(g => g.id === goal.id);
              if (originalGoal) onEdit(originalGoal);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
            title="Editar objetivo"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Excluir meta"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progresso */}
      <div>
        <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
          <span>Progresso ({percentComplete}%)</span>
          <span>{formatBRL(goal.currentSavedForGoal)} / {formatBRL(goal.valorObjetivo)}</span>
        </div>
        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentComplete === 100 
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' 
                : 'bg-indigo-500'
            }`}
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* Analítica */}
      <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-xs gap-2">
          <span className="text-slate-400">Data Alvo Limite:</span>
          <strong className="text-slate-200">{formatarData(`${goal.dataAlvo}-01`)}</strong>
        </div>

        <div className="flex justify-between items-center text-xs gap-2 border-t border-slate-800/40 pt-2">
          <span className="text-slate-400">Previsão Real de Conclusão:</span>
          <strong className={`font-extrabold ${goal.achievable ? 'text-emerald-400' : 'text-amber-400'}`}>
            {goal.reachedDateStr === 'N/A' ? 'Sem aportes ativos' : `${goal.reachedDateStr} (${goal.monthsNeeded} meses)`}
          </strong>
        </div>

        {/* Otimizador de aporte */}
        {!goal.achievable && (goal.caixinhaVinculadaIds?.length || goal.caixinhaVinculadaId) && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg p-3 text-xs flex flex-col gap-2.5 mt-1">
            <div className="flex gap-2 items-start">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-extrabold block mb-0.5">Ajuste Recomendado</span>
                Para atingir este objetivo dentro do prazo, aumente o aporte de uma de suas caixinhas vinculadas para <strong>{formatBRL(goal.requiredAporte)}</strong> mensais.
              </div>
            </div>
            <button
              onClick={() => {
                const targetId = goal.caixinhaVinculadaIds?.[0] || goal.caixinhaVinculadaId;
                if (targetId) onOptimize(targetId, goal.requiredAporte);
              }}
              className="self-end px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-[10px] transition shadow-md shadow-amber-600/15"
            >
              Aplicar Aporte Sugerido
            </button>
          </div>
        )}

        {goal.achievable && (goal.caixinhaVinculadaIds?.length || goal.caixinhaVinculadaId) && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg p-3 text-xs flex items-start gap-2 mt-1">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-extrabold block">Tudo sob controle!</span>
              Seu ritmo de poupança atual é suficiente para atingir o objetivo com sucesso.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

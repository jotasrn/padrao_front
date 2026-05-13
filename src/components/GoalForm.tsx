import React, { useState, useEffect } from 'react';
import { Target, X } from 'lucide-react';
import { Goal, Caixinha } from '../types';

interface GoalFormProps {
  caixinhas: Caixinha[];
  editingGoal: Goal | null;
  onSubmit: (data: {
    nome: string;
    valorObjetivo: number;
    dataAlvo: string;
    caixinhaVinculadaIds: string[];
    aporteSalarioDireto: number;
    descricao?: string;
  }) => void;
  onCancel: () => void;
  formatBRL: (val: number) => string;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  caixinhas,
  editingGoal,
  onSubmit,
  onCancel,
  formatBRL,
}) => {
  const [gNome, setGNome] = useState('');
  const [gValor, setGValor] = useState('');
  const [gData, setGData] = useState('2026-12');
  const [gCaixinhaIds, setGCaixinhaIds] = useState<string[]>([]);
  const [gAporteSalarioDireto, setGAporteSalarioDireto] = useState('');
  const [gDesc, setGDesc] = useState('');

  useEffect(() => {
    if (editingGoal) {
      setGNome(editingGoal.nome);
      setGValor(editingGoal.valorObjetivo.toString());
      setGData(editingGoal.dataAlvo);
      setGCaixinhaIds(editingGoal.caixinhaVinculadaIds || []);
      setGAporteSalarioDireto(editingGoal.aporteSalarioDireto?.toString() || '');
      setGDesc(editingGoal.descricao || '');
    } else {
      setGNome('');
      setGValor('');
      setGData('2026-12');
      setGCaixinhaIds([]);
      setGAporteSalarioDireto('');
      setGDesc('');
    }
  }, [editingGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gNome || !gValor || !gData) return;

    onSubmit({
      nome: gNome,
      valorObjetivo: parseFloat(gValor) || 0,
      dataAlvo: gData,
      caixinhaVinculadaIds: gCaixinhaIds,
      aporteSalarioDireto: parseFloat(gAporteSalarioDireto) || 0,
      descricao: gDesc,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl max-w-2xl flex flex-col gap-4 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Target className="h-4 w-4 text-indigo-400" /> {editingGoal ? 'Editar Objetivo' : 'Adicionar Novo Objetivo'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Nome do Objetivo</label>
          <input
            type="text"
            value={gNome}
            onChange={(e) => setGNome(e.target.value)}
            required
            placeholder="Ex: Comprar Notebook, Viagem Internacional..."
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Valor do Objetivo (Meta R$)</label>
          <input
            type="number"
            value={gValor}
            onChange={(e) => setGValor(e.target.value)}
            required
            placeholder="0.00"
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Mês Alvo (Prazo de Conclusão)</label>
          <input
            type="month"
            value={gData}
            onChange={(e) => setGData(e.target.value)}
            required
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-400 font-bold mb-1.5 flex items-center gap-1">
            Aporte Direto do Salário (R$/mês)
            <span className="text-[9px] text-slate-500 font-normal">(além das caixinhas)</span>
          </label>
          <input
            type="number"
            value={gAporteSalarioDireto}
            onChange={(e) => setGAporteSalarioDireto(e.target.value)}
            placeholder="0.00"
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col sm:col-span-2">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Vincular Investimentos (Caixinhas)</label>
          {caixinhas.length === 0 ? (
            <p className="text-[11px] text-amber-400">Você não possui nenhuma caixinha criada ainda. Crie uma caixinha na aba "Caixinhas" para poder vinculá-la!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              {caixinhas.map(cx => {
                const isSelected = gCaixinhaIds.includes(cx.id);
                return (
                  <button
                    type="button"
                    key={cx.id}
                    onClick={() => {
                      if (isSelected) {
                        setGCaixinhaIds(gCaixinhaIds.filter(id => id !== cx.id));
                      } else {
                        setGCaixinhaIds([...gCaixinhaIds, cx.id]);
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition border ${
                      isSelected 
                        ? 'bg-indigo-600/15 border-indigo-500/50 text-white' 
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate pr-1">{cx.nome}</span>
                    <span className="text-[10px] text-indigo-400 font-black whitespace-nowrap shrink-0">{formatBRL(cx.valorAtual)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:col-span-2">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Descrição Opcional</label>
          <input
            type="text"
            value={gDesc}
            onChange={(e) => setGDesc(e.target.value)}
            placeholder="Uma nota curta para se motivar..."
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-800 pt-3 mt-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-750 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition"
        >
          {editingGoal ? 'Salvar Alterações' : 'Salvar Objetivo'}
        </button>
      </div>
    </form>
  );
};

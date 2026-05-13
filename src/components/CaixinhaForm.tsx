import React, { useState, useEffect } from 'react';
import { PiggyBank, X } from 'lucide-react';
import { Caixinha } from '../types';

interface CaixinhaFormProps {
  editingCaixinha: Caixinha | null;
  onSubmit: (data: {
    nome: string;
    valorAtual: number;
    aporteMensal: number;
    rendimentoCdiPct: number;
  }) => void;
  onCancel: () => void;
}

export const CaixinhaForm: React.FC<CaixinhaFormProps> = ({
  editingCaixinha,
  onSubmit,
  onCancel,
}) => {
  const [cxNome, setCxNome] = useState('');
  const [cxValor, setCxValor] = useState('');
  const [cxAporte, setCxAporte] = useState('');
  const [cxRendimento, setCxRendimento] = useState('100');

  useEffect(() => {
    if (editingCaixinha) {
      setCxNome(editingCaixinha.nome);
      setCxValor(editingCaixinha.valorAtual.toString());
      setCxAporte(editingCaixinha.aporteMensal.toString());
      setCxRendimento(editingCaixinha.rendimentoCdiPct?.toString() || '100');
    } else {
      setCxNome('');
      setCxValor('');
      setCxAporte('');
      setCxRendimento('100');
    }
  }, [editingCaixinha]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cxNome || !cxValor || !cxAporte) return;

    onSubmit({
      nome: cxNome,
      valorAtual: parseFloat(cxValor) || 0,
      aporteMensal: parseFloat(cxAporte) || 0,
      rendimentoCdiPct: parseFloat(cxRendimento) || 100,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl max-w-2xl flex flex-col gap-4 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <PiggyBank className="h-4 w-4 text-indigo-400" /> {editingCaixinha ? 'Editar Caixinha' : 'Criar Nova Caixinha'}
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
          <label className="text-xs text-slate-400 font-bold mb-1.5">Nome do Investimento/Caixinha</label>
          <input
            type="text"
            value={cxNome}
            onChange={(e) => setCxNome(e.target.value)}
            required
            placeholder="Ex: Emergência, Viagem, Aposentadoria..."
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Valor Já Acumulado Inicial (R$)</label>
          <input
            type="number"
            value={cxValor}
            onChange={(e) => setCxValor(e.target.value)}
            required
            placeholder="0.00"
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Aporte Mensal (Guardar todo mês) (R$)</label>
          <input
            type="number"
            value={cxAporte}
            onChange={(e) => setCxAporte(e.target.value)}
            required
            placeholder="Ex: 200"
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Rendimento (% do CDI)</label>
          <input
            type="number"
            min="10"
            max="500"
            step="1"
            value={cxRendimento}
            onChange={(e) => setCxRendimento(e.target.value)}
            required
            placeholder="Ex: 100 ou 110"
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
          <span className="text-[10px] text-slate-400 mt-1">
            CDI atual: ~10,75% a.a. Normal = 100% CDI. Turbo = 101% a 115% CDI.
          </span>
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
          {editingCaixinha ? 'Salvar Alterações' : 'Criar Caixinha'}
        </button>
      </div>
    </form>
  );
};

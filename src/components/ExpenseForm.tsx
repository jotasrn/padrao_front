import React, { useState, useEffect } from 'react';
import { TrendingDown, X } from 'lucide-react';
import { Expense } from '../types';

interface ExpenseFormProps {
  editingExpense: Expense | null;
  onSubmit: (data: {
    descricao: string;
    valor: number;
    categoria: Expense['categoria'];
    vencimento: number;
    tipo: Expense['tipo'];
    parcelasTotais?: number;
    parcelaAtual?: number;
  }) => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  editingExpense,
  onSubmit,
  onCancel,
}) => {
  const [expDesc, setExpDesc] = useState('');
  const [expVal, setExpVal] = useState('');
  const [expCat, setExpCat] = useState<Expense['categoria']>('Moradia');
  const [expDay, setExpDay] = useState('5');
  const [expTipo, setExpTipo] = useState<Expense['tipo']>('Recorrente');
  const [expParcelasTotais, setExpParcelasTotais] = useState('12');
  const [expParcelaAtual, setExpParcelaAtual] = useState('1');

  useEffect(() => {
    if (editingExpense) {
      setExpDesc(editingExpense.descricao);
      setExpVal(editingExpense.valor.toString());
      setExpCat(editingExpense.categoria);
      setExpDay(editingExpense.vencimento.toString());
      setExpTipo(editingExpense.tipo || 'Recorrente');
      setExpParcelasTotais(editingExpense.parcelasTotais?.toString() || '12');
      setExpParcelaAtual(editingExpense.parcelaAtual?.toString() || '1');
    } else {
      setExpDesc('');
      setExpVal('');
      setExpCat('Moradia');
      setExpDay('5');
      setExpTipo('Recorrente');
      setExpParcelasTotais('12');
      setExpParcelaAtual('1');
    }
  }, [editingExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc || !expVal) return;

    onSubmit({
      descricao: expDesc,
      valor: parseFloat(expVal) || 0,
      categoria: expCat,
      vencimento: parseInt(expDay) || 5,
      tipo: expTipo,
      parcelasTotais: expTipo === 'Parcelada' ? parseInt(expParcelasTotais) || 12 : undefined,
      parcelaAtual: expTipo === 'Parcelada' ? parseInt(expParcelaAtual) || 1 : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl max-w-2xl flex flex-col gap-4 animate-fadeIn">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <TrendingDown className="h-4 w-4 text-rose-400" /> {editingExpense ? 'Editar Gasto' : 'Adicionar Novo Gasto'}
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
          <label className="text-xs text-slate-400 font-bold mb-1.5">Descrição/Nome do Gasto</label>
          <input
            type="text"
            value={expDesc}
            onChange={(e) => setExpDesc(e.target.value)}
            required
            placeholder="Ex: Conta de Luz, Internet, Mercado..."
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Valor (R$)</label>
          <input
            type="number"
            value={expVal}
            onChange={(e) => setExpVal(e.target.value)}
            required
            placeholder="0.00"
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Categoria do Gasto</label>
          <select
            value={expCat}
            onChange={(e) => setExpCat(e.target.value as Expense['categoria'])}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="Moradia">Moradia</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Transporte">Transporte</option>
            <option value="Saúde">Saúde</option>
            <option value="Educação">Educação</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Dia de Vencimento</label>
          <input
            type="number"
            min="1"
            max="31"
            value={expDay}
            onChange={(e) => setExpDay(e.target.value)}
            required
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-col sm:col-span-2">
          <label className="text-xs text-slate-400 font-bold mb-1.5">Frequência do Gasto</label>
          <select
            value={expTipo}
            onChange={(e) => setExpTipo(e.target.value as Expense['tipo'])}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="Recorrente">Mensal / Recorrente (Ex: Luz, Aluguel)</option>
            <option value="Única">Gasto Único / Temporário (Ex: Compras pontuais, Faturas)</option>
            <option value="Parcelada">Parcelado (Ex: Compras no Cartão)</option>
          </select>
        </div>

        {expTipo === 'Parcelada' && (
          <div className="grid grid-cols-2 gap-3 sm:col-span-2 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-col">
              <label className="text-xs text-slate-400 font-bold mb-1.5">Total de Parcelas</label>
              <input
                type="number"
                min="2"
                value={expParcelasTotais}
                onChange={(e) => setExpParcelasTotais(e.target.value)}
                required
                placeholder="Ex: 12"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-slate-400 font-bold mb-1.5">Parcela Atual</label>
              <input
                type="number"
                min="1"
                max={expParcelasTotais}
                value={expParcelaAtual}
                onChange={(e) => setExpParcelaAtual(e.target.value)}
                required
                placeholder="Ex: 1"
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
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
          {editingExpense ? 'Salvar Alterações' : 'Salvar Gasto'}
        </button>
      </div>
    </form>
  );
};

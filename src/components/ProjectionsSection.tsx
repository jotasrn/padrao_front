import React from 'react';
import { CalendarDays, Info } from 'lucide-react';
import { Caixinha, Aggregates } from '../types';

interface ProjectionsSectionProps {
  caixinhas: Caixinha[];
  aggregates: Aggregates;
  projections: any[];
  projectionMonths: number;
  setProjectionMonths: (val: number) => void;
  formatBRL: (val: number) => string;
  onNavigateToCaixinhas: () => void;
}

export const ProjectionsSection: React.FC<ProjectionsSectionProps> = ({
  caixinhas,
  aggregates,
  projections,
  projectionMonths,
  setProjectionMonths,
  formatBRL,
  onNavigateToCaixinhas,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white">Previsão e Simulação Mensal Completa</h2>
          <p className="text-xs text-slate-400">Veja o saldo planejado mês a mês nas caixinhas de poupança.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
          <span className="text-xs font-bold text-slate-300 shrink-0">Simular:</span>
          <input
            type="range"
            min="6"
            max="36"
            step="6"
            value={projectionMonths}
            onChange={(e) => setProjectionMonths(parseInt(e.target.value))}
            className="w-24 md:w-32 accent-indigo-600"
          />
          <span className="text-xs font-extrabold text-white bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded shrink-0">{projectionMonths} meses</span>
        </div>
      </div>

      {caixinhas.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center">
          <CalendarDays className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold">Sem caixinhas para simulação!</p>
          <p className="text-xs mb-4">Você precisa de pelo menos uma caixinha cadastrada com investimento mensal ativo para ver as simulações de juros.</p>
          <button
            onClick={onNavigateToCaixinhas}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/15 inline-flex items-center gap-1"
          >
            Ir para Caixinhas
          </button>
        </div>
      ) : (
        <>
          {/* Resumo da Previsão */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-bold uppercase block">Patrimônio Atual</span>
              <strong className="text-lg font-black text-slate-200 mt-0.5 block">{formatBRL(aggregates.totalSaved)}</strong>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-bold uppercase block">Economia ({projectionMonths} m)</span>
              <strong className="text-lg font-black text-emerald-400 mt-0.5 block">{formatBRL(aggregates.totalAportes * projectionMonths)}</strong>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950/50">
              <span className="text-xs text-slate-400 font-bold uppercase block">Juros Ganhos ({projectionMonths} m)</span>
              <strong className="text-lg font-black text-indigo-400 mt-0.5 block">
                {formatBRL(
                  Math.max(0, (projections[projectionMonths - 1]?.saldoCaixinhasTotal || 0) -
                    aggregates.totalSaved -
                    (aggregates.totalAportes * projectionMonths))
                )}
              </strong>
            </div>
          </div>

          {/* Tabela de Previsão */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs md:text-sm font-extrabold text-white">Evolução do Saldo Projetado</span>
              <span className="text-[9px] text-indigo-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                <Info className="h-3.5 w-3.5 shrink-0" /> juros compostos mensais
              </span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-black uppercase tracking-wider bg-slate-950/25">
                    <th className="px-6 py-4">Mês/Ano</th>
                    <th className="px-6 py-4">Aporte Recorrente</th>
                    <th className="px-6 py-4">Juros Acumulados</th>
                    <th className="px-6 py-4">Saldo Projetado</th>
                    {caixinhas.map(cx => (
                      <th key={cx.id} className="px-6 py-4 text-slate-500 font-semibold">{cx.nome}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projections.slice(0, projectionMonths).map((p, idx) => {
                    const totalAportesSimulados = aggregates.totalAportes * (idx + 1);
                    const jurosAcumuladosMes = p.saldoCaixinhasTotal - aggregates.totalSaved - totalAportesSimulados;

                    return (
                      <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/20 transition">
                        <td className="px-6 py-3.5 font-bold text-white text-xs">{p.mesAno}</td>
                        <td className="px-6 py-3.5 font-semibold text-slate-300 text-xs">{formatBRL(p.investimentoAporte)}</td>
                        <td className="px-6 py-3.5 font-bold text-indigo-400 text-xs">+{formatBRL(Math.max(0, jurosAcumuladosMes))}</td>
                        <td className="px-6 py-3.5 font-black text-cyan-400 text-xs">{formatBRL(p.saldoCaixinhasTotal)}</td>

                        {caixinhas.map(cx => (
                          <td key={cx.id} className="px-6 py-3.5 text-slate-400 text-xs">
                            {formatBRL(p.saldosDetalhados[cx.id] || 0)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List for Projections (Perfect responsiveness, no table overflows!) */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {projections.slice(0, projectionMonths).filter((_, idx) => idx % 2 === 0 || idx === projectionMonths - 1).map((p, idx) => {
                const totalAportesSimulados = aggregates.totalAportes * (projections.indexOf(p) + 1);
                const jurosAcumuladosMes = p.saldoCaixinhasTotal - aggregates.totalSaved - totalAportesSimulados;

                return (
                  <div key={idx} className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-xs font-black text-indigo-400">{p.mesAno}</span>
                      <span className="text-xs font-black text-cyan-400">{formatBRL(p.saldoCaixinhasTotal)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                      <div>
                        <span>Aportado Total:</span>
                        <strong className="text-slate-200 block mt-0.5">{formatBRL(p.investimentoAporte)}</strong>
                      </div>
                      <div className="text-right">
                        <span>Juros Recebidos:</span>
                        <strong className="text-indigo-400 block mt-0.5">+{formatBRL(Math.max(0, jurosAcumuladosMes))}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

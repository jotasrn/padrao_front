import { useState, useMemo } from 'react';
import { X, Search, FileText, Bus, ArrowRight } from 'lucide-react';
import { ParadaGeo } from '../services/paradaService';

interface StopModalProps {
  parada: ParadaGeo;
  linhas: string[];
  onClose: () => void;
  onSelectLine: (numero: string) => void;
  onGenerateReport: () => void;
}

export const StopModal = ({ parada, linhas, onClose, onSelectLine, onGenerateReport }: StopModalProps) => {
  const [search, setSearch] = useState('');

  const linhasFiltradas = useMemo(() => {
    return linhas.filter(l => l.toLowerCase().includes(search.toLowerCase()));
  }, [linhas, search]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-slideUp">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-sky-500 text-white font-black px-2.5 py-1 rounded text-xs">PONTO {parada.properties.codParada}</span>
            <span className="text-sky-400 text-[10px] font-black uppercase tracking-widest">{parada.properties.regiao || 'DF'}</span>
          </div>
          
          <h2 className="text-lg font-black leading-tight uppercase mb-1">
            {parada.properties.endereco || 'Endereço não informado'}
          </h2>
          <p className="text-slate-400 text-xs font-medium">
            {parada.properties.nomeAbrigo || 'Abrigo Padrão'}
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Filtrar número da linha..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-sky-500/20 outline-none transition-all font-bold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Lines List */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {linhasFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 gap-1">
              {linhasFiltradas.map((linha, idx) => {
                const numero = linha.split(' - ')[0];
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectLine(numero)}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                        <Bus size={20} />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-black text-slate-800 block leading-none">{numero}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Clique para carregar no mapa</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-sky-500 transform group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-400 font-medium">Nenhuma linha encontrada.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 mt-auto">
          <button
            onClick={onGenerateReport}
            className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <FileText size={16} className="text-sky-600" />
            Gerar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};

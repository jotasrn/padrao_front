import React from 'react';
import { Search, X, RefreshCw, Star } from 'lucide-react';

interface SearchBoxProps {
  query: string;
  setQuery: (val: string) => void;
  resultados: any[];
  loading: boolean;
  onSelect: (linha: any) => void;
  onToggleFavorite: (linha: any) => void;
  isFavorite: (numero: string) => boolean;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ 
  query, setQuery, resultados, loading, onSelect, onToggleFavorite, isFavorite 
}) => {
  return (
    <div className="relative w-full max-w-xl z-[100]">
      <div className="flex items-center bg-white rounded-2xl px-5 py-3 shadow-2xl border border-white/20 transition-all focus-within:ring-2 focus-within:ring-blue-400">
        <Search className="text-slate-400 mr-3" size={20} />
        <input
          autoFocus
          className="flex-1 outline-none text-base font-medium text-slate-700 bg-transparent"
          placeholder="Número (ex: 0.110) ou nome da linha..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading ? (
          <RefreshCw className="animate-spin text-blue-500" size={18} />
        ) : query && (
          <X className="text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => setQuery('')} size={18} />
        )}
      </div>

      {/* Dropdown de Resultados */}
      {query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar animate-slideDown">
          {resultados.length > 0 ? resultados.map((linha) => (
            <div 
              key={linha.numero} 
              className="p-4 hover:bg-blue-50 cursor-pointer border-b border-slate-50 flex items-center justify-between group transition-colors"
              onClick={() => onSelect(linha)}
            >
              {/* Container de Informações com limite de largura para não empurrar o favorito */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Número da linha (font-semibold para ser mais fino que o font-black anterior) */}
                <div className="bg-blue-600 text-white font-semibold px-2 py-1 rounded text-[10px] min-w-[55px] text-center shadow-sm shrink-0">
                  {linha.numero}
                </div>
                
                {/* Descrição e Operadora com Truncate */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-700 truncate block">
                    {linha.descricao}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-medium truncate">
                    {linha.operadora}
                  </span>
                </div>
              </div>
              
              {/* Botão de Favorito (z-index e shrink-0 para garantir visibilidade) */}
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onToggleFavorite(linha); 
                }}
                className="p-2 hover:bg-white rounded-full transition-all shrink-0 ml-2"
              >
                <Star 
                  size={18} 
                  className={isFavorite(linha.numero) 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-slate-300 group-hover:text-slate-400"
                  } 
                />
              </button>
            </div>
          )) : !loading && (
            <div className="p-8 text-center text-slate-400 text-xs font-bold italic">
              Nenhuma linha encontrada para "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
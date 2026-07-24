import { useState, useEffect } from 'react';
import {
  Bus, Star, X,
  ChevronLeft, ChevronRight, ExternalLink,
  Map as MapIcon,
  Info, ArrowLeft
} from 'lucide-react';
import { useNavigation } from '../../../hooks/useNavigation';
import { useResponsive } from '../../../hooks/useResponsive';

// Importação dos serviços e hooks de arquitetura
import { extraService } from './services/extraService';
import { useBuscaLinhas } from './hooks/useBuscaLinhas';
import { SearchBox } from './components/SearchBox';
import ResultadoLinha from './screens/ResultadoLinha';
import MapaOperacional from './screens/MapaOperacional';

interface Linha {
  numero: string;
  descricao: string;
  tarifa: number;
  operadora?: string;
}

interface Noticia {
  id: string;
  titulo: string;
  descricao: string;
  link: string;
  img: string;
}

export default function InfoonibusIndex({ sidebarAberta: propSidebarAberta }: { sidebarAberta?: boolean }) {
  const { navegarPara } = useNavigation();
  const { isMobile } = useResponsive();

  // Sincroniza estado da sidebar localmente
  const [sidebarAberta, setSidebarAberta] = useState(() => {
    return propSidebarAberta !== undefined ? propSidebarAberta : (window.innerWidth >= 768);
  });

  useEffect(() => {
    const handleChanged = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setSidebarAberta(customEvent.detail);
    };
    window.addEventListener('sidebar-changed', handleChanged);
    return () => {
      window.removeEventListener('sidebar-changed', handleChanged);
    };
  }, []);

  // Substituído: Agora usamos o Hook de arquitetura para a busca
  const { query, setQuery, resultados, loading } = useBuscaLinhas();

  // Restaura a linha selecionada ao voltar (F5 ou troca de rota)
  const [linhaSelecionada, setLinhaSelecionada] = useState<string | null>(() => {
    return sessionStorage.getItem('@SISMOB:infoonibus_linha') || null;
  });

  const [mostrarMapa, setMostrarMapa] = useState(false);

  const selecionarLinha = (numero: string) => {
    sessionStorage.setItem('@SISMOB:infoonibus_linha', numero);
    setLinhaSelecionada(numero);
  };

  const voltarParaLista = () => {
    sessionStorage.removeItem('@SISMOB:infoonibus_linha');
    setLinhaSelecionada(null);
  };

  const [favoritos, setFavoritos] = useState<Linha[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [noticiaIndex, setNoticiaIndex] = useState(0);

  // Componente de Imagem com Auth (Mantido conforme solicitado)
  const ImageWithAuth = ({ url }: { url: string }) => {
    const [src, setSrc] = useState<string | null>(null);
    useEffect(() => {
      async function getAuthorizedImage() {
        try {
          const response = await extraService.carregarImagemProtegida(url);
          setSrc(response);
        } catch (e) {
          console.error("Erro ao carregar imagem protegida", e);
        }
      }
      getAuthorizedImage();
    }, [url]);
    if (!src) return <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center"><Bus className="text-slate-300" /></div>;
    return <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />;
  };

  // Carregamento Inicial
  useEffect(() => {
    async function loadData() {
      try {
        const news = await extraService.buscarNoticias();
        setNoticias(news);
      } catch (e) { console.error(e); }
      const saved = localStorage.getItem('@SISMOB:infoonibus_favs');
      if (saved) setFavoritos(JSON.parse(saved));
    }
    loadData();
  }, []);

  const toggleFavorito = (linha: Linha) => {
    let novosFavs;
    if (favoritos.find(f => f.numero === linha.numero)) {
      novosFavs = favoritos.filter(f => f.numero !== linha.numero);
    } else {
      if (favoritos.length >= 5) return alert("Limite atingido.");
      novosFavs = [...favoritos, linha];
    }
    setFavoritos(novosFavs);
    localStorage.setItem('@SISMOB:infoonibus_favs', JSON.stringify(novosFavs));
  };

  const handleSelectLinha = (linha: Linha) => {
    selecionarLinha(linha.numero);
  };

  if (linhaSelecionada) {
    return (
      <ResultadoLinha
        numero={linhaSelecionada}
        onVoltar={voltarParaLista}
        sidebarAberta={sidebarAberta}
      />
    );
  }

  if (mostrarMapa) {
    return (
      <MapaOperacional
        onVoltar={() => setMostrarMapa(false)}
        sidebarAberta={sidebarAberta}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fadeIn w-full h-[calc(100vh-80px)] flex flex-col overflow-hidden text-gray-900 max-w-7xl mx-auto text-left">

      {/* HEADER REDUZIDO */}
      <div className="flex items-center justify-between mb-4 shrink-0 px-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="bg-sky-500 p-1.5 rounded-lg text-white">
              <Info size={20} />
            </div>
            Visualização Operacional de Linhas
          </h1>
          <p className="text-xs text-gray-500">Consultar linhas em tempo real</p>
        </div>

        <button
          onClick={() => navegarPara('dashboard')}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all"
        >
          <ArrowLeft size={14} /> Voltar ao Portal
        </button>
      </div>

      {/* HERO BUSCA (LAYOUT MANTIDO - COMPONENTE INTEGRADO) */}
      {/* HERO BUSCA: Removido 'overflow-hidden' para o dropdown aparecer por cima */}
      <section className={`relative shrink-0 rounded-2xl ${isMobile ? 'h-32' : 'h-44'} bg-gradient-to-br from-blue-700 to-blue-900 shadow-lg mb-6`}>
        {/* A imagem de fundo agora carrega o 'rounded-2xl' para não vazar */}
        <div className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl overflow-hidden">
          <img src="/images/brasilia.png" alt="" className="w-full h-full object-cover" />
        </div>

        {/* Conteúdo centralizado */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4">
          <h2 className="text-white font-bold text-xl md:text-3xl mb-4 text-center tracking-tight">
            Aonde vamos hoje?
          </h2>

          {/* Chamada do componente SearchBox */}
          <SearchBox
            query={query}
            setQuery={setQuery}
            resultados={resultados}
            loading={loading}
            onSelect={handleSelectLinha}
            onToggleFavorite={toggleFavorito}
            isFavorite={(num) => !!favoritos.find(f => f.numero === num)}
          />
        </div>
      </section>

      {/* CONTEÚDO DISTRIBUÍDO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden pb-4">
        {/* LADO ESQUERDO: FAVORITOS E AÇÕES */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <Star className="text-yellow-400 fill-yellow-400" size={18} />
              <h2 className="text-base font-bold text-gray-800">Linhas Favoritas</h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {favoritos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Bus className="text-gray-300 mb-2" size={32} />
                  <p className="text-gray-400 text-xs">Suas linhas aparecerão aqui.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {favoritos.map(fav => (
                    <div key={fav.numero} onClick={() => selecionarLinha(fav.numero)} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-xs shrink-0">
                          {fav.numero}
                        </div>
                        {/* Removido truncate e max-w para o texto aparecer completo */}
                        <span className="text-gray-700 font-semibold text-xs leading-tight">
                          {fav.descricao}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorito(fav); }}
                        className="ml-2 shrink-0"
                      >
                        <X className="text-gray-300 hover:text-red-500 transition-colors" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
            <button 
              onClick={() => setMostrarMapa(true)}
              className="flex items-center justify-center p-3.5 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all gap-2 shadow-sm font-bold text-[10px] uppercase text-gray-600"
            >
              <MapIcon size={18} className="text-blue-600" /> Mapa
            </button>
          </div>
        </div>

        {/* LADO DIREITO: NOTÍCIAS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Notícias</h2>
            <div className="flex gap-1">
              <button onClick={() => setNoticiaIndex(prev => Math.max(0, prev - 1))} className="p-1 hover:bg-gray-100 rounded disabled:opacity-20" disabled={noticiaIndex === 0}><ChevronLeft size={16} /></button>
              <button onClick={() => setNoticiaIndex(prev => Math.min(noticias.length - 1, prev + 1))} className="p-1 hover:bg-gray-100 rounded disabled:opacity-20" disabled={noticiaIndex >= noticias.length - 1}><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto pr-1">
            {noticias.length > 0 ? (
              noticias.slice(noticiaIndex, noticiaIndex + 2).map(news => (
                <div key={news.id} className="cursor-pointer group flex flex-col gap-2" onClick={() => window.open(news.link, '_blank')}>
                  <div className="h-28 rounded-lg overflow-hidden relative shadow-inner bg-slate-100">
                    <ImageWithAuth url={news.img} />
                  </div>
                  <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-600">{news.titulo}</h3>
                  <div className="flex items-center text-blue-600 text-[9px] font-black uppercase">Ler mais <ExternalLink size={10} className="ml-1" /></div>
                </div>
              ))
            ) : [1, 2].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse mb-4" />)}
          </div>
        </div>
      </div>

      {/* RODAPÉ FIXO */}
      <footer className="text-center py-2 shrink-0 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
          Secretaria de Estado de Transporte e Mobilidade - GDF
        </p>
      </footer>
    </div>
  );
}
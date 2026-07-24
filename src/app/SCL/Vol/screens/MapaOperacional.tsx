import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, RefreshCw, Search, Info, Map as MapIcon, MapPin, Bus, Route, Satellite, Menu } from 'lucide-react';
import { VeiculoPosicao, OPERADORAS } from '../services/mapaService';
import { SidePanelInfo } from '../components/SidePanelInfo';
import { paradaService } from '../services/paradaService';
import { linhaService } from '../services/linhaService';
import { veiculosService } from '../services/veiculosService';
import { StopModal } from '../components/StopModal';
import { RelatorioParada } from '../components/RelatorioParada';
import { useMapaOperacional } from '../hooks/useMapaOperacional';
import { MapaOperacionalProps } from '../types';
import userIconPng from '../assets/images/user.png';

// Cores por Operadora (Modernas e Premium)
const OPERADORA_COLORS: Record<string, string> = {
  'Urbi': '#3b82f6', // blue
  'Piracicabana': '#ef4444', // red
  'Pioneira': '#22c55e', // green
  'Marechal': '#f59e0b', // amber
  'São José (BsBus)': '#a855f7' // purple
};

// Cores por Sentido
const SENTIDO_COLORS: Record<string, string> = {
  'IDA': '#0ea5e9',      // Sky Blue
  'VOLTA': '#f43f5e',    // Pink/Rose
  'CIRCULAR': '#10b981'  // Emerald
};

// Função para criar ícone de ônibus com rotação (direção) e número da linha
const createBusIcon = (operadora: string, direcao: number, linha?: string, simplificado = false) => {
  const color = OPERADORA_COLORS[operadora] || '#64748b';
  
  if (simplificado) {
    return L.divIcon({
      html: `<div style="width: 14px; height: 14px; background: ${color}; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
               <svg viewBox="0 0 24 24" width="8" height="8" fill="white"><path d="M19 13V5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v8c-1.66 0-3 1.34-3 3v5h2c0 .55.45 1 1 1h1c.55 0 1-.45 1-1h6c0 .55.45 1 1 1h1c.55 0 1-.45 1-1h2v-5c0-1.66-1.34-3-3-3zM7.5 5h3v2h-3V5zm9 8h-9V9h9v4zm0-6h-3V5h3v2zM6.5 16c.83 0 1.5.67 1.5 1.5S7.33 19 6.5 19 5 18.33 5 17.5 5.67 16 6.5 16zm11 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
             </div>`,
      className: 'simple-bus-icon',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  }

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="transform: rotate(${direcao}deg); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; border: 3px solid ${color}; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: all 0.3s ease;">
           <svg viewBox="0 0 24 24" width="18" height="18" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
             <path d="M12 2l3.5 14H8.5L12 2z"></path>
           </svg>
        </div>
        ${linha ? `
          <div style="position: absolute; bottom: -12px; background: ${color}; color: white; padding: 1px 5px; border-radius: 6px; font-size: 10px; font-weight: 900; white-space: nowrap; border: 1.5px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index: 10;">
            ${linha}
          </div>
        ` : ''}
      </div>
    `,
    className: 'custom-bus-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Sub-componente para capturar zoom e limites (bounds) dinamicamente
function MapStateTracker({ 
  onZoomChange, 
  onBoundsChange 
}: { 
  onZoomChange: (zoom: number) => void;
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
      onBoundsChange(map.getBounds());
    },
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
  });

  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}

const MapFlyTo = ({ lat, lng }: { lat?: number | null, lng?: number | null }) => {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null && map) {
      map.flyTo([lat, lng], 17, { animate: true, duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
};

const MapResizeFix = () => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 400);
    return () => clearTimeout(timer);
  }, [map]);
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(map.getContainer());
    return () => resizeObserver.disconnect();
  }, [map]);
  return null;
};

const AutoFitFiltered = ({ posicoes, isSearching }: { posicoes: VeiculoPosicao[], isSearching: boolean }) => {
  const map = useMap();
  useEffect(() => {
    if (isSearching && posicoes.length > 0 && posicoes.length < 50 && map) {
      const coords = posicoes.map(p => [p.latitude, p.longitude] as [number, number]);
      const bounds = L.latLngBounds(coords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [posicoes, isSearching, map]);
  return null;
};

// Limites do Distrito Federal para manter o mapa focado em Brasília e arredores
const DF_BOUNDS = L.latLngBounds(
  [-16.30, -48.40],
  [-15.30, -47.10]
);

export default function MapaOperacional({ onVoltar, sidebarAberta }: MapaOperacionalProps) {
  const {
    loading, setLoading, searchQuery, setSearchQuery, filtroOperadora, setFiltroOperadora,
    zoomLevel, setZoomLevel, setMapBounds, countdown, modoMapa, setModoMapa,
    selectedStop, setSelectedStop, stopLines, setStopLines,
    showStopReport, setShowStopReport, showSidePanel, setShowSidePanel,
    dadosLinha, setDadosLinha, horarios, setHorarios, itinerario, setItinerario,
    veiculosLinha, setVeiculosLinha, itinerariosMapa, setItinerariosMapa,
    posicoesFiltradas, paradasNaTela, veiculosIsolados, clusters, posicoes
  } = useMapaOperacional();

  const posicoesParaZoom = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return posicoes.filter((p: VeiculoPosicao) => {
      const matchSearch = p.prefixo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.linha.toLowerCase().includes(searchQuery.toLowerCase());
      const matchOp = filtroOperadora === 'TODAS' || p.operadora === filtroOperadora;
      return matchSearch && matchOp;
    });
  }, [posicoes, searchQuery, filtroOperadora]);

  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  const [veiculoFoco, setVeiculoFoco] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
        (error) => console.warn("Erro ao obter localização:", error)
      );
    }
  }, []);

  const selecionarLinhaGenerico = async (numLinha: string) => {
    setLoading(true);
    try {
      const info = await linhaService.buscarInformacoes(numLinha);
      const linhaData = Array.isArray(info) ? info[0] : info;
      setDadosLinha({ ...linhaData, numero: numLinha });

      const [h, i, p] = await Promise.all([
        linhaService.buscarHorarios(numLinha),
        linhaService.buscarItinerarioDescritivo(numLinha),
        linhaService.buscarPercursos(numLinha)
      ]);

      setHorarios(h || []);
      setItinerario(i || []);

      const newItinerarios: any[] = [];
      
      const processPercurso = (percursoArray: any[], sense: string, color: string) => {
        if (!percursoArray || percursoArray.length === 0) return;
        const percurso = percursoArray[0];
        const coords: [number, number][] = (percurso?.GeoLinhas?.coordinates || [])
          .map((c: any) => [Number(c[1]), Number(c[0])] as [number, number])
          .filter((c: [number, number]) => !isNaN(c[0]) && !isNaN(c[1]));
        
        if (coords.length > 0) {
          newItinerarios.push({
            linha: numLinha,
            coordinates: coords,
            color,
            sentido: sense
          });
        }
      };

      processPercurso(p.IDA, 'IDA', SENTIDO_COLORS.IDA);
      processPercurso(p.VOLTA, 'VOLTA', SENTIDO_COLORS.VOLTA);
      processPercurso(p.CIRCULAR, 'CIRCULAR', SENTIDO_COLORS.CIRCULAR);

      setItinerariosMapa(newItinerarios);

      const vLinha = await veiculosService.buscarPosicaoPorLinha(numLinha);
      setVeiculosLinha(vLinha.features || []);

      setShowSidePanel(true);
    } catch (err) {
      console.error("Erro ao carregar detalhes da linha", err);
    } finally {
      setLoading(false);
    }
  };

  const selecionarVeiculo = (veiculo: VeiculoPosicao) => {
    selecionarLinhaGenerico(veiculo.linha);
  };

  const ClusterMarker = ({ c, index }: { c: any, index: number }) => {
    const map = useMap();
    return (
      <Marker
        key={`cluster-${index}`}
        position={[c.lat, c.lng]}
        eventHandlers={{
          click: () => map.setZoomAround([c.lat, c.lng], map.getZoom() + 2, { animate: true })
        }}
        icon={L.divIcon({
          html: `<div style="width: 32px; height: 32px; background: rgba(59, 130, 246, 0.9); border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 11px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); backdrop-filter: blur(4px);">
                    ${c.count}
                  </div>`,
          className: 'custom-cluster-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })}
      />
    );
  };

  // Usar CSS variable para garantir sincronia com a sidebar global
  const sidebarWidth = windowWidth < 768 ? '0px' : (sidebarAberta ? '256px' : '80px');

  return (
    <div 
      className="fixed inset-0 bg-white z-[40] flex flex-col animate-fadeIn overflow-hidden transition-all duration-300 print:!relative print:!block print:!h-auto print:!overflow-visible print:!inset-auto print:!left-0 print:!w-full print:!p-0 print:!m-0" 
      style={{ left: sidebarWidth, width: `calc(100% - ${sidebarWidth})` }}
    >

      {/* HEADER DO MAPA - RESPONSIVO E MODERNO */}
      <div 
        className="fixed top-0 right-0 min-h-[80px] bg-slate-900 text-white p-3 md:p-4 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 z-[1000] transition-all duration-300 print:hidden overflow-y-auto max-h-[50vh] md:max-h-none md:overflow-visible"
        style={{ left: sidebarWidth }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
            className="md:hidden p-2 hover:bg-slate-800 rounded-full transition-colors group shrink-0"
          >
            <Menu className="w-6 h-6 text-slate-400 group-active:-translate-y-0.5 transition-transform" />
          </button>
          <button
            onClick={onVoltar}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors group shrink-0"
          >
            <ArrowLeft className="w-6 h-6 group-active:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              <MapIcon className="text-sky-400" size={20} />
              Operação em Tempo Real (SISMOB-VOL)
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 flex items-center gap-2">
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Próxima atualização em: <span className="text-sky-400 font-bold w-4 inline-block">{countdown}</span>s
              </p>
              {itinerariosMapa.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded-full">
                  <Route size={10} className="text-sky-400" />
                  <span className="text-[10px] font-black text-sky-400 uppercase">Linha {itinerariosMapa[0].linha} Ativa</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTROLES DE BUSCA E MODO */}
        <div className="flex flex-col md:flex-row gap-2 flex-1 max-w-4xl">
          <button
            onClick={() => setModoMapa(prev => prev === 'VEICULOS' ? 'PARADAS' : 'VEICULOS')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all whitespace-nowrap shadow-md ${modoMapa === 'PARADAS' ? 'bg-sky-500 text-white border border-sky-400' : 'bg-slate-800 text-sky-400 border border-slate-700 hover:bg-slate-700'}`}
          >
            {modoMapa === 'PARADAS' ? <MapPin size={16} /> : <Bus size={16} />}
            {modoMapa === 'PARADAS' ? 'MODO PARADAS' : 'MODO VEÍCULOS'}
          </button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Filtrar por Prefixo (ex: 501387) ou Linha (ex: 0.782)..."
              disabled={modoMapa === 'PARADAS'}
              className="w-full bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white placeholder:text-slate-600 focus:ring-2 focus:ring-sky-500/50 outline-none transition-all disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) {
                  setShowSidePanel(false);
                  setItinerariosMapa([]);
                  setVeiculoFoco(null);
                }
              }}
            />
          </div>

          <select
            value={filtroOperadora}
            onChange={(e) => setFiltroOperadora(e.target.value)}
            disabled={modoMapa === 'PARADAS'}
            className="bg-slate-800 border-none rounded-xl px-4 py-2.5 text-sm font-black text-slate-300 outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50"
          >
            <option value="TODAS">TODAS OPERADORAS</option>
            {OPERADORAS.map(op => (
              <option key={op.id} value={op.nome}>{op.nome.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PAINEL FLUTUANTE DE KPI E SELETOR DE MAPA */}
       <div className="absolute bottom-10 left-6 z-[1000] flex items-center gap-3 print:hidden">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
            {modoMapa === 'PARADAS' ? 'Paradas na Tela' : 'Veículos Visíveis'}
          </p>
          <div className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-2">
            {modoMapa === 'PARADAS' ? paradasNaTela.length : posicoesFiltradas.length}
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-glow shadow-emerald-500"></div>
          </div>
        </div>

        <button 
          onClick={() => setMapMode(mapMode === 'street' ? 'satellite' : 'street')} 
          className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 text-blue-600 shadow-2xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center self-end h-[68px] w-[68px]"
          title={mapMode === 'street' ? 'Visualização Satélite' : 'Visualização Mapa'}
        >
          {mapMode === 'street' ? <Satellite size={24} /> : <MapIcon size={24} />}
        </button>
      </div>

      {/* LEGENDA DE ITINERÁRIOS */}
      {itinerariosMapa.length > 0 && (
        <div className="absolute top-auto bottom-36 md:bottom-auto md:top-28 left-4 md:left-6 z-[999] flex flex-col gap-2 animate-fadeInLeft print:hidden">
          <div className="bg-slate-900/90 backdrop-blur-md p-3 md:p-4 rounded-3xl shadow-2xl border border-slate-700">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Legenda do Itinerário</p>
            <div className="space-y-2.5">
              {itinerariosMapa.map((it, idx) => (
                <div key={`legend-${idx}`} className="flex items-center gap-3">
                  <div className="w-8 h-1.5 rounded-full" style={{ backgroundColor: it.color }}></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-tight">Sentido {it.sentido}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAPA LEAFLET */}
      <div className="flex-1 relative z-10 mt-[120px] md:mt-20 print:hidden">
        <MapContainer
          center={[-15.7942, -47.8822]} // Brasília
          zoom={12}
          minZoom={10}
          maxZoom={18}
          maxBounds={DF_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
          preferCanvas={true}
        >
          <MapStateTracker onZoomChange={setZoomLevel} onBoundsChange={setMapBounds} />
          <MapResizeFix />
          <AutoFitFiltered posicoes={posicoesParaZoom} isSearching={searchQuery.length >= 2} />
          
          <TileLayer
            url={mapMode === 'street' 
              ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' 
              : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'}
            keepBuffer={12}
            updateWhenZooming={false}
          />

          {/* RENDERIZAÇÃO DE ITINERÁRIOS ATIVOS */}
          {itinerariosMapa.map((it, i) => (
            <Polyline
              key={`poly-${it.linha}-${it.sentido}-${i}`}
              positions={it.coordinates}
              pathOptions={{ color: it.color, weight: 6, opacity: 0.8, lineJoin: 'round' }}
            />
          ))}

          {/* AVISO DE ZOOM PARA PARADAS */}
          {modoMapa === 'PARADAS' && zoomLevel < 15 && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-slate-700 flex flex-col items-center justify-center gap-2 animate-fadeIn pointer-events-auto max-w-sm text-center">
                <Search size={32} className="text-sky-400 mb-2" />
                <h3 className="text-white font-black text-lg">Aproxime o Zoom</h3>
                <p className="text-slate-400 text-xs font-bold leading-relaxed">
                  Existem mais de 6.000 paradas no DF. Para garantir a velocidade, aproxime mais a imagem do mapa para visualizar e interagir com os pontos de parada.
                </p>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                   <div 
                     className="bg-sky-500 h-full transition-all" 
                     style={{ width: `${Math.min(100, (zoomLevel / 15) * 100)}%` }}
                   />
                </div>
              </div>
            </div>
          )}

          {/* RENDERIZAÇÃO DE PARADAS (MUITAS) - OTIMIZADA */}
          {modoMapa === 'PARADAS' && zoomLevel >= 15 && paradasNaTela.map((p) => (
             <CircleMarker
                key={`stop-${p.properties.codParada}`}
                center={[p.geometry.coordinates[1], p.geometry.coordinates[0]]}
                radius={7}
                pathOptions={{
                   color: '#1e293b',
                   weight: 3.5,
                   fillColor: '#ffffff',
                   fillOpacity: 1,
                   className: 'stop-pill-marker'
                }}
                eventHandlers={{
                   click: async () => {
                     const linhasNoPonto = await paradaService.buscarLinhasPorParada(p.properties.codParada);
                     setStopLines(linhasNoPonto);
                     setSelectedStop(p);
                   }
                }}
             />
          ))}

          {/* RENDERIZAÇÃO DE CLUSTERS (ZOOM < 16) */}
          {clusters.map((c, i) => (
             <ClusterMarker key={`cluster-${i}`} c={c} index={i} />
          ))}

          {/* MARCADOR DE LOCALIZAÇÃO DO USUÁRIO */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.icon({
                iconUrl: userIconPng,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
                className: 'drop-shadow-lg'
              })}
            >
               <Popup className="bus-popup">
                 <div className="p-2 text-center text-xs font-bold text-slate-800">Sua localização atual</div>
               </Popup>
            </Marker>
          )}

          {/* RENDERIZAÇÃO DE VEÍCULOS VISÍVEIS NA TELA */}
          {veiculosIsolados.map((veiculo) => {
             // Em zoom baixo (<16), usamos CircleMarker (Canvas) para manter performance fluida
             if (zoomLevel < 16) {
               return (
                 <CircleMarker
                    key={veiculo.prefixo}
                    center={[veiculo.latitude, veiculo.longitude]}
                    radius={6}
                    pathOptions={{
                       color: 'white',
                       weight: 1,
                       fillColor: OPERADORA_COLORS[veiculo.operadora] || '#64748b',
                       fillOpacity: 1
                    }}
                    eventHandlers={{ click: () => selecionarVeiculo(veiculo) }}
                 />
               );
             }

             // Em zoom alto (>=16), usamos o ícone de ônibus detalhado
             return (
              <Marker
                key={veiculo.prefixo}
                position={[veiculo.latitude, veiculo.longitude]}
                icon={createBusIcon(veiculo.operadora, veiculo.direcao, veiculo.linha, false)}
                eventHandlers={{
                  click: () => selecionarVeiculo(veiculo)
                }}
              >
                <Popup className="bus-popup">
                  <div className="p-1 min-w-[180px]">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
                      <span className="bg-slate-900 text-white font-black px-2 py-0.5 rounded text-[10px]">{veiculo.prefixo}</span>
                      <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">{veiculo.operadora}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Linha</span>
                        <span className="text-sm font-black text-slate-800 tracking-tighter">{veiculo.linha}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Velocidade</span>
                        <span className="text-sm font-black text-emerald-600 tracking-tighter">{veiculo.velocidade} <span className="text-[8px] opacity-60">km/h</span></span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-50 flex items-center gap-1.5 grayscale opacity-50">
                      <Info size={12} />
                      <span className="text-[8px] font-bold text-slate-500 uppercase">{veiculo.data}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
             );
          })}
          <MapFlyTo 
            lat={veiculoFoco ? veiculoFoco.geometry.coordinates[1] : null} 
            lng={veiculoFoco ? veiculoFoco.geometry.coordinates[0] : null} 
          />
        </MapContainer>
      </div>

      {/* MODAIS DE PARADA E RELATÓRIO */}
      <div className="print:hidden">
        {selectedStop && !showStopReport && (
          <StopModal 
            parada={selectedStop}
            linhas={stopLines}
            onClose={() => setSelectedStop(null)}
            onSelectLine={(newNum) => {
              selecionarLinhaGenerico(newNum);
              setSelectedStop(null);
            }}
            onGenerateReport={() => setShowStopReport(true)}
          />
        )}
      </div>

      {showStopReport && selectedStop && (
        <RelatorioParada 
          parada={selectedStop}
          linhas={stopLines}
          onClose={() => setShowStopReport(false)}
        />
      )}

      {/* SIDEBAR INFORMATIVA LINHA */}
      <div className="print:hidden">
        <SidePanelInfo
          horarios={horarios}
          itinerario={itinerario}
          veiculos={veiculosLinha}
          dadosLinha={dadosLinha}
          showSidePanel={showSidePanel}
          setShowSidePanel={setShowSidePanel}
          sentidoAtivo="IDA"
          topOffset={96} // Abaixo da AppBar (80px) + margem
          onVehicleClick={(v) => {
             setVeiculoFoco(v);
             // On mobile we probably want to close the sidebar to see the map
             if (window.innerWidth < 768) setShowSidePanel(false);
          }}
        />
      </div>


      <style>{`
        .leaflet-container { background: #f8fafc; }
        .bus-popup .leaflet-popup-content-wrapper { 
          border-radius: 20px; 
          padding: 8px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        }
        .bus-popup .leaflet-popup-tip-container { display: none; }
        .shadow-glow { box-shadow: 0 0 8px currentColor; }
        .stop-pill-marker { 
          filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3)); 
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .stop-pill-marker:hover {
          transform: scale(1.3);
          stroke: #2563eb;
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeInLeft {
          animation: fadeInLeft 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

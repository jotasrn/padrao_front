import { useEffect, useCallback, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap, Pane, CircleMarker } from 'react-leaflet';
import { ArrowLeft, Map as MapIcon, Satellite, RefreshCw, Menu } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { paradaService } from '../services/paradaService';
import { SidePanelInfo } from '../components/SidePanelInfo';
import { VeiculoModal } from '../components/VeiculoModal';
import { StopModal } from '../components/StopModal';
import { RelatorioParada } from '../components/RelatorioParada';
import { useResultadoLinha } from '../hooks/useResultadoLinha';

import urbiBus from '../assets/images/urbiBus.png';
import saoJoseBus from '../assets/images/sao_joseBus.png';
import piracicabanaBus from '../assets/images/piracicabanaBus.png';
import pioneiraBus from '../assets/images/pioneiraBus.png';
import marechalBus from '../assets/images/marechalBus.png';
import defaultBus from '../assets/images/defaultBus.png';
import userIconPng from '../assets/images/user.png';

interface ResultadoLinhaProps {
  numero: string;
  onVoltar: () => void;
  sidebarAberta?: boolean;
}

// Limites do Distrito Federal para manter o mapa focado em Brasília e arredores
const DF_BOUNDS = L.latLngBounds(
  [-16.30, -48.40],
  [-15.30, -47.10]
);

const AutoFitBounds = ({ coords }: { coords: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0 && map) {
      try {
        const bounds = L.latLngBounds(coords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] });
          const timer = setTimeout(() => {
            if (map && typeof map.invalidateSize === 'function') map.invalidateSize();
          }, 300);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.warn("[INFOONIBUS] Erro ao ajustar limites do mapa:", e);
      }
    }
  }, [coords, map]);
  return null;
};

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

export default function ResultadoLinha({ numero, onVoltar, sidebarAberta }: ResultadoLinhaProps) {
  const {
    activeNumero, setActiveNumero, loading, mapMode, setMapMode, sentido, setSentido,
    showSidePanel, setShowSidePanel, selectedStop, setSelectedStop, stopLines, setStopLines,
    showReport, setShowReport, dadosLinha, veiculosFiltrados, paradasAtiva, horarios,
    itinerario, veiculoSelecionado, setVeiculoSelecionado, polylineCoords
  } = useResultadoLinha(numero);

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

  const getBusImage = useCallback((operadora: string) => {
    const nome = operadora?.toUpperCase() || '';
    if (nome.includes('PIRACICABANA')) return piracicabanaBus;
    if (nome.includes('PIONEIRA')) return pioneiraBus;
    if (nome.includes('MARECHAL')) return marechalBus;
    if (nome.includes('URBI')) return urbiBus;
    if (nome.includes('SÃO JOSÉ') || nome.includes('SAO JOSE')) return saoJoseBus;
    return defaultBus;
  }, []);

  const createBusIcon = useCallback((heading: string, operadora: string) => {
    const imgPath = getBusImage(operadora);
    return L.divIcon({
      className: 'custom-bus-icon',
      html: `<div style="transform: rotate(${heading}deg); transition: transform 0.5s ease-in-out; width: 30px; height: 30px;">
               <img src="${imgPath}" style="width: 30px; height: 30px;" />
             </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  }, [getBusImage]);

  const tileUrl = mapMode === 'street'
    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  const sidebarWidth = windowWidth < 768 ? '0px' : (sidebarAberta ? '256px' : '80px');

  if (loading) return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300" style={{ left: sidebarWidth }}>
      <RefreshCw className="animate-spin text-blue-600 mb-2" />
      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest text-center">Conectando a SEMOB...</span>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 h-screen overflow-hidden bg-white z-[40] transition-all duration-300 print:!relative print:!block print:!h-auto print:!overflow-visible print:!inset-auto print:!left-0 print:!w-full print:!p-0 print:!m-0" 
      style={{ left: sidebarWidth, width: `calc(100% - ${sidebarWidth})` }}
    >
      <div className="absolute inset-0 z-0 print:hidden">
        <MapContainer 
          center={[-15.7942, -47.8822]} 
          zoom={12} 
          minZoom={10}
          maxZoom={18}
          maxBounds={DF_BOUNDS}
          maxBoundsViscosity={1.0}
          className="h-full w-full" 
          zoomControl={false} 
          preferCanvas={true}
        >
          <TileLayer 
            url={tileUrl} 
            keepBuffer={8}
            updateWhenZooming={false}
          />

          {/* RENDERIZAÇÃO DE PARADAS (STOPS) - ALTA PERFORMANCE */}
          {paradasAtiva.map((p) => (
            <CircleMarker
              key={`stop-${p.properties.codParada}`}
              center={[p.geometry.coordinates[1], p.geometry.coordinates[0]]}
              radius={7}
              pathOptions={{
                color: '#1e293b',  // Azul escuro slate-800
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

          <Pane name="busPane" style={{ zIndex: 600 }}>
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
              />
            )}
            {veiculosFiltrados.map((v) => (
              <Marker
                key={v.properties.prefixo}
                position={[v.geometry.coordinates[1], v.geometry.coordinates[0]]}
                icon={createBusIcon(v.properties.direcao, v.properties.operadora)}
                eventHandlers={{
                  click: () => setVeiculoSelecionado(v),
                }}
              />
            ))}
            <style>{`
        .stop-pill-marker { 
          filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3)); 
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .stop-pill-marker:hover {
          transform: scale(1.3);
          stroke: #2563eb;
        }
      `}</style>
          </Pane>
          {polylineCoords.length > 0 && (
            <>
              <Polyline positions={polylineCoords as L.LatLngExpression[]} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.7 }} />
              <AutoFitBounds coords={polylineCoords as [number, number][]} />
            </>
          )}
          <MapFlyTo 
            lat={veiculoFoco ? veiculoFoco.geometry.coordinates[1] : null} 
            lng={veiculoFoco ? veiculoFoco.geometry.coordinates[0] : null} 
          />
        </MapContainer>
      </div>

      <div className="print:hidden">
         <VeiculoModal
           veiculo={veiculoSelecionado}
           onClose={() => setVeiculoSelecionado(null)}
         />
      </div>

      <div className="print:hidden">
        {selectedStop && !showReport && (
          <StopModal 
            parada={selectedStop}
            linhas={stopLines}
            onClose={() => setSelectedStop(null)}
            onSelectLine={(newNum) => {
              setActiveNumero(newNum);
              setSelectedStop(null);
            }}
            onGenerateReport={() => setShowReport(true)}
          />
        )}
      </div>

      {showReport && selectedStop && (
        <RelatorioParada 
          parada={selectedStop}
          linhas={stopLines}
          onClose={() => setShowReport(false)}
        />
      )}

      <div className="absolute top-4 z-20 flex flex-col md:flex-row gap-4 pointer-events-none transition-all duration-300 ease-in-out print:hidden" style={{ left: '1rem' }}>
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-2.5 rounded-2xl shadow-2xl flex items-center gap-2 pointer-events-auto shrink-0 max-w-full">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
            className="md:hidden p-2 hover:bg-slate-100 rounded-full text-slate-400 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={onVoltar} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 shrink-0"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-3 border-l pl-3 min-w-0">
            <span className="bg-blue-600 text-white font-black px-2.5 py-1 rounded text-sm shrink-0">{activeNumero}</span>
            <h1 className="text-[11px] font-medium text-slate-800 uppercase leading-none truncate">{dadosLinha?.descricao || 'Carregando...'}</h1>
          </div>
        </div>
        <div className="flex gap-2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-slate-200 flex">
            {sentido === 'CIRCULAR' ? (
              <button className="px-6 py-1.5 rounded-lg text-[10px] font-medium bg-blue-600 text-white shadow-sm">CIRCULAR</button>
            ) : (
              <>
                <button onClick={() => setSentido('IDA')} className={`px-4 py-1.5 rounded-lg text-[10px] font-medium transition-all ${sentido === 'IDA' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>IDA</button>
                <button onClick={() => setSentido('VOLTA')} className={`px-4 py-1.5 rounded-lg text-[10px] font-medium transition-all ${sentido === 'VOLTA' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>VOLTA</button>
              </>
            )}
          </div>
          <button onClick={() => setMapMode(mapMode === 'street' ? 'satellite' : 'street')} className="bg-white/95 backdrop-blur-md p-2.5 rounded-xl border text-blue-600 shadow-lg">
            {mapMode === 'street' ? <Satellite size={20} /> : <MapIcon size={20} />}
          </button>
        </div>
      </div>

      <div className="print:hidden">
        <SidePanelInfo 
          horarios={horarios} 
          itinerario={itinerario} 
          veiculos={veiculosFiltrados} 
          dadosLinha={dadosLinha} 
          showSidePanel={showSidePanel} 
          setShowSidePanel={setShowSidePanel} 
          sentidoAtivo={sentido} 
          onVehicleClick={(v) => {
             setVeiculoFoco(v);
             setVeiculoSelecionado(v);
             if (window.innerWidth < 768) setShowSidePanel(false);
          }}
        />
      </div>

      <div className="absolute bottom-4 z-20 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border shadow-lg text-[8px] font-medium text-slate-400 uppercase tracking-widest transition-all duration-300 print:hidden" style={{ left: '1rem' }}>
        SUTINF - Secretaria de Transporte e Mobilidade
      </div>
    </div>
  );
}
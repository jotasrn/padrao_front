import { useState, useEffect, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { VeiculoPosicao, mapaService } from '../services/mapaService';
import { paradaService, ParadaGeo } from '../services/paradaService';
import { ClusterInfo, ModoMapa } from '../types';

export function useMapaOperacional() {
  const [posicoes, setPosicoes] = useState<VeiculoPosicao[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroOperadora, setFiltroOperadora] = useState('TODAS');
  const [zoomLevel, setZoomLevel] = useState(12);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [countdown, setCountdown] = useState(30);

  const [modoMapa, setModoMapa] = useState<ModoMapa>('VEICULOS');
  
  const [todasParadas, setTodasParadas] = useState<ParadaGeo[]>([]);
  const [selectedStop, setSelectedStop] = useState<ParadaGeo | null>(null);
  const [stopLines, setStopLines] = useState<string[]>([]);
  const [showStopReport, setShowStopReport] = useState(false);

  const [showSidePanel, setShowSidePanel] = useState(false);
  const [dadosLinha, setDadosLinha] = useState<any>(null);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [itinerario, setItinerario] = useState<any[]>([]);
  const [veiculosLinha, setVeiculosLinha] = useState<any[]>([]);
  const [itinerariosMapa, setItinerariosMapa] = useState<any[]>([]); 

  const fetchPosicoes = useCallback(async () => {
    if (modoMapa === 'PARADAS') return;
    setLoading(true);
    try {
      const data = await mapaService.buscarTodasPosicoes();
      setPosicoes(data || []);
      setCountdown(30);
    } catch {
      setPosicoes([]);
    } finally {
      setLoading(false);
    }
  }, [modoMapa]);

  useEffect(() => {
    if (modoMapa === 'PARADAS' && todasParadas.length === 0) {
      setLoading(true);
      paradaService.buscarGeoParadas()
        .then(data => setTodasParadas(data?.features || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
    if (modoMapa === 'VEICULOS') {
      fetchPosicoes();
    }
  }, [modoMapa, todasParadas.length, fetchPosicoes]);

  // Intervalos de refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (modoMapa === 'VEICULOS') fetchPosicoes();
    }, 30000);

    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 30);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [modoMapa, fetchPosicoes]);

  const posicoesNaTela = useMemo(() => {
    if (!mapBounds) return posicoes;
    return posicoes.filter(p => mapBounds.contains([p.latitude, p.longitude]));
  }, [posicoes, mapBounds]);

  const paradasNaTela = useMemo(() => {
    if (modoMapa !== 'PARADAS' || !mapBounds) return [];
    return todasParadas.filter(p => p.geometry?.coordinates && mapBounds.contains([p.geometry.coordinates[1], p.geometry.coordinates[0]]));
  }, [todasParadas, mapBounds, modoMapa]);

  const posicoesFiltradas = useMemo(() => {
    return posicoesNaTela.filter(p => {
      const matchSearch = searchQuery.trim() === '' ||
        p.prefixo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.linha.toLowerCase().includes(searchQuery.toLowerCase());
      const matchOp = filtroOperadora === 'TODAS' || p.operadora === filtroOperadora;
      return matchSearch && matchOp;
    });
  }, [posicoesNaTela, searchQuery, filtroOperadora]);

  const clusters = useMemo(() => {
    if (modoMapa === 'PARADAS') return [];
    if (zoomLevel >= 16) return []; 

    const gridSize = 0.012 * (17 - zoomLevel); 
    const gridMap = new Map<string, VeiculoPosicao[]>();

    posicoesFiltradas.forEach(p => {
      const latIdx = Math.floor(p.latitude / gridSize);
      const lngIdx = Math.floor(p.longitude / gridSize);
      const key = `${latIdx}_${lngIdx}`;
      
      if (!gridMap.has(key)) gridMap.set(key, []);
      gridMap.get(key)!.push(p);
    });

    const result: ClusterInfo[] = [];
    for (const pts of gridMap.values()) {
      if (pts.length > 1) {
        let sumLat = 0, sumLng = 0;
        const ids = [];
        for (const p of pts) {
          sumLat += p.latitude;
          sumLng += p.longitude;
          ids.push(p.prefixo);
        }
        result.push({
          lat: sumLat / pts.length,
          lng: sumLng / pts.length,
          count: pts.length,
          ids
        });
      }
    }
    return result;
  }, [posicoesFiltradas, zoomLevel, modoMapa]);

  const veiculosIsolados = useMemo(() => {
    if (modoMapa === 'PARADAS') return [];
    if (zoomLevel >= 16) return posicoesFiltradas;
    
    const clusteredSet = new Set<string>();
    for (let i = 0; i < clusters.length; i++) {
        for (let j = 0; j < clusters[i].ids.length; j++) {
            clusteredSet.add(clusters[i].ids[j]);
        }
    }
    return posicoesFiltradas.filter(p => !clusteredSet.has(p.prefixo));
  }, [posicoesFiltradas, clusters, zoomLevel, modoMapa]);

  return {
    posicoes, loading, setLoading, searchQuery, setSearchQuery, filtroOperadora, setFiltroOperadora,
    zoomLevel, setZoomLevel, mapBounds, setMapBounds, countdown, modoMapa, setModoMapa,
    todasParadas, selectedStop, setSelectedStop, stopLines, setStopLines,
    showStopReport, setShowStopReport, showSidePanel, setShowSidePanel,
    dadosLinha, setDadosLinha, horarios, setHorarios, itinerario, setItinerario,
    veiculosLinha, setVeiculosLinha, itinerariosMapa, setItinerariosMapa,
    posicoesFiltradas, paradasNaTela, veiculosIsolados, clusters
  };
}

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { linhaService } from '../services/linhaService';
import { veiculosService } from '../services/veiculosService';
import { paradaService, ParadaGeo } from '../services/paradaService';

export function useResultadoLinha(initialNumero: string) {
  const [activeNumero, setActiveNumero] = useState(initialNumero);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [mapMode, setMapMode] = useState<'street' | 'satellite'>('street');
  const [sentido, setSentido] = useState<'IDA' | 'VOLTA' | 'CIRCULAR'>('IDA');
  const [showSidePanel, setShowSidePanel] = useState(true);

  // Estados de Parada e Relatório
  const [selectedStop, setSelectedStop] = useState<ParadaGeo | null>(null);
  const [stopLines, setStopLines] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);

  const [dadosLinha, setDadosLinha] = useState<any>(null);
  const [percursos, setPercursos] = useState<any>(null);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [paradasAtiva, setParadasAtiva] = useState<ParadaGeo[]>([]);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [itinerario, setItinerario] = useState<any[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<any | null>(null);

  const carregarPosicaoVeiculos = useCallback(async () => {
    try {
      const v = await veiculosService.buscarPosicaoPorLinha(activeNumero);
      if (v?.features) setVeiculos(v.features);
    } catch (err) { console.error(err); }
  }, [activeNumero]);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const [info, perc, h, it, p] = await Promise.all([
        linhaService.buscarInformacoes(activeNumero),
        linhaService.buscarPercursos(activeNumero),
        linhaService.buscarHorarios(activeNumero),
        linhaService.buscarItinerarioDescritivo(activeNumero),
        paradaService.buscarParadasPorLinha(activeNumero, sentido)
      ]);

      setDadosLinha(info?.[0] || null);
      setPercursos(perc);
      setHorarios(h || []);
      setItinerario(Array.isArray(it) ? it : (it?.itinerario || []));
      setParadasAtiva(p || []);

      if (perc?.CIRCULAR && perc.CIRCULAR.length > 0) setSentido('CIRCULAR');
      await carregarPosicaoVeiculos();
    } catch (err) { 
      console.error("Erro ao carregar dados da linha:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [activeNumero, sentido, carregarPosicaoVeiculos]);

  useEffect(() => {
    carregarDados();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => { carregarPosicaoVeiculos(); }, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeNumero, sentido, carregarDados, carregarPosicaoVeiculos]);

  const veiculosFiltrados = useMemo(() => {
    if (sentido === 'CIRCULAR') return veiculos;
    return veiculos.filter(v => v.properties.sentido === sentido);
  }, [veiculos, sentido]);

  const polylineCoords = useMemo(() => {
    if (!percursos || !percursos[sentido]) return [];
    const dadosSentido = percursos[sentido];
    if (!Array.isArray(dadosSentido)) return [];
    return dadosSentido.flatMap((trecho: any) => {
      if (trecho.GeoLinhas?.coordinates) {
        return trecho.GeoLinhas.coordinates.map((coord: any) => [coord[1], coord[0]]);
      }
      return [];
    });
  }, [percursos, sentido]);

  return {
    activeNumero, setActiveNumero,
    loading,
    mapMode, setMapMode,
    sentido, setSentido,
    showSidePanel, setShowSidePanel,
    selectedStop, setSelectedStop,
    stopLines, setStopLines,
    showReport, setShowReport,
    dadosLinha,
    veiculosFiltrados,
    paradasAtiva,
    horarios,
    itinerario,
    veiculoSelecionado, setVeiculoSelecionado,
    polylineCoords
  };
}

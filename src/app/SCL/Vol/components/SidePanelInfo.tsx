import React, { useState, useMemo, useEffect } from 'react';
import { Clock, Navigation, X, Calendar, Info, Bus, Gauge, Landmark, FileSearch } from 'lucide-react';
import { useNavigation } from '../../../../hooks/useNavigation';

interface SidePanelInfoProps {
    horarios: any[];
    itinerario: any[];
    veiculos: any[];
    dadosLinha: any;
    showSidePanel: boolean;
    setShowSidePanel: (val: boolean) => void;
    sentidoAtivo: 'IDA' | 'VOLTA' | 'CIRCULAR';
    topOffset?: number; // Permite flutuar abaixo da AppBar
    onVehicleClick?: (veiculo: any) => void;
}

type MenuPrincipal = 'HORARIOS' | 'ITINERARIO' | 'VEICULOS' | 'INFORMACOES';

export const SidePanelInfo: React.FC<SidePanelInfoProps> = ({
    horarios,
    itinerario,
    veiculos,
    dadosLinha,
    showSidePanel,
    setShowSidePanel,
    sentidoAtivo,
    topOffset = 16, // Default top-4 (~16px)
    onVehicleClick
}) => {
    const [abaPrincipal, setAbaPrincipal] = useState<MenuPrincipal>('HORARIOS');
    const [redirecionando, setRedirecionando] = useState(false);
    const { navegarPara } = useNavigation();

    const listaItinerarioReal = useMemo(() => {
        if (!itinerario || !Array.isArray(itinerario)) return [];
        if (itinerario[0] && itinerario[0].itinerario) return itinerario[0].itinerario;
        return itinerario;
    }, [itinerario]);

    const gruposDeHorarios = useMemo(() => {
        const grupos: Record<string, any[]> = {};
        const siglaAlvo = sentidoAtivo === 'IDA' ? 'I' : sentidoAtivo === 'VOLTA' ? 'V' : 'C';
        const dadosDoSentido = horarios.find(obj => obj.sentido === siglaAlvo) || horarios[0];

        if (dadosDoSentido && dadosDoSentido.horarios) {
            dadosDoSentido.horarios.forEach((h: any) => {
                const label = h.dia_label || 'Outros';
                if (!grupos[label]) grupos[label] = [];
                grupos[label].push(h);
            });
        }

        const getPeso = (label: string) => {
            const l = label.toUpperCase();
            if (l.includes('SEGUNDA') || l.includes('ÚTEIS') || l.includes('UTIL')) return 1;
            if (l.includes('SÁBADO') || l.includes('SABADO')) return 2;
            if (l.includes('DOMINGO') || l.includes('FERIADO')) return 3;
            return 4;
        };

        return Object.keys(grupos)
            .sort((a, b) => getPeso(a) - getPeso(b))
            .reduce((obj, key) => {
                obj[key] = grupos[key];
                return obj;
            }, {} as Record<string, any[]>);
    }, [horarios, sentidoAtivo]);

    const listaAbasDias = Object.keys(gruposDeHorarios);
    const [abaDiaAtiva, setAbaDiaAtiva] = useState<string>('');

    useEffect(() => {
        if (listaAbasDias.length > 0) {
            if (!abaDiaAtiva || !listaAbasDias.includes(abaDiaAtiva)) {
                setAbaDiaAtiva(listaAbasDias[0]);
            }
        }
    }, [listaAbasDias, abaDiaAtiva]);

    if (!showSidePanel) {
        return (
            <button
                onClick={() => setShowSidePanel(true)}
                className="absolute right-4 bottom-32 md:bottom-auto md:top-4 z-[2000] md:z-30 bg-blue-600 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95"
            >
                <Clock size={24} />
            </button>
        );
    }

    return (
        <div 
            className="fixed inset-x-0 bottom-0 z-[2000] flex flex-col h-[70vh] animate-slideUp md:absolute md:inset-auto md:right-4 md:bottom-20 md:w-80 md:h-auto md:z-20 md:gap-4 md:animate-slideInRight"
            style={{ 
                top: window.innerWidth >= 768 ? `${topOffset}px` : 'auto'
            }}
        >
            <div className="bg-white/95 backdrop-blur-md rounded-t-3xl md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-2xl border-t md:border border-slate-200 flex-1 flex flex-col overflow-hidden text-slate-900">
                
                {/* Mobile Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1 md:hidden bg-white/50 shrink-0">
                   <div className="w-12 h-1.5 bg-slate-300/80 rounded-full"></div>
                </div>

                <div className="p-4 border-b flex items-center justify-between bg-white/50 shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Painel de Controle</h2>
                        <span className="text-[9px] text-blue-600 font-medium uppercase mt-0.5">
                            {sentidoAtivo} • {dadosLinha?.numero || 'Linha'}
                        </span>
                    </div>
                    <button onClick={() => setShowSidePanel(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex border-b bg-slate-50/50">
                    {(['HORARIOS', 'ITINERARIO', 'VEICULOS', 'INFORMACOES'] as MenuPrincipal[]).map((item) => (
                        <button
                            key={item}
                            onClick={() => setAbaPrincipal(item)}
                            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${
                                abaPrincipal === item ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {item === 'HORARIOS' && <Clock size={16} />}
                            {item === 'ITINERARIO' && <Navigation size={16} />}
                            {item === 'VEICULOS' && <Bus size={16} />}
                            {item === 'INFORMACOES' && <Info size={16} />}
                            <span className="text-[8px] font-bold uppercase">{item.slice(0, 4)}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    
                    {abaPrincipal === 'HORARIOS' && (
                        <div className="flex flex-col gap-4 animate-fadeIn">
                            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2 border-b">
                                {listaAbasDias.map((label) => (
                                    <button
                                        key={label}
                                        onClick={() => setAbaDiaAtiva(label)}
                                        className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[9px] font-medium transition-all border ${
                                            abaDiaAtiva === label ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100'
                                        }`}
                                    >
                                        {label.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                            {gruposDeHorarios[abaDiaAtiva]?.length > 0 ? (
                                <div className="grid grid-cols-3 gap-1.5">
                                    {gruposDeHorarios[abaDiaAtiva].map((h, i) => (
                                        <div key={i} className="bg-slate-50/80 p-2 rounded-xl border border-slate-100 text-center shadow-sm">
                                            <p className="text-xs font-medium text-blue-700">{h.horario}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 opacity-30"><Calendar size={32} /><p className="text-[10px] mt-2 italic">Sem saídas.</p></div>
                            )}
                        </div>
                    )}

                    {abaPrincipal === 'ITINERARIO' && (
                        <div className="space-y-2 animate-fadeIn">
                            {listaItinerarioReal.length > 0 ? (
                                listaItinerarioReal.map((p: any, i: number) => (
                                    <div key={i} className="flex gap-3 items-start border-l-2 border-blue-400/30 pl-3 ml-1 py-1">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-medium text-slate-600 uppercase leading-tight">{p.via}</span>
                                            <span className="text-[7px] text-slate-400 uppercase">{p.localidade}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[9px] text-slate-400 italic text-center py-10 uppercase">Itinerário não disponível</p>
                            )}
                        </div>
                    )}

                    {abaPrincipal === 'VEICULOS' && (
                        <div className="space-y-3 animate-fadeIn">
                            <div className="bg-blue-50 p-2 rounded-xl mb-4 text-center border border-blue-100">
                                <p className="text-[10px] font-bold text-blue-700 uppercase">Frota Online: {veiculos?.length || 0}</p>
                            </div>
                            {veiculos && veiculos.length > 0 ? (
                                veiculos.map((v, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => onVehicleClick?.(v)}
                                        className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50 active:scale-[0.98] transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100"><Bus size={14}/></div>
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-800">{v.properties?.prefixo || 'N/A'}</p>
                                                <div className="flex items-center gap-1 text-[9px] text-slate-400"><Gauge size={10}/> {v.properties?.velocidade || 0} km/h</div>
                                            </div>
                                        </div>
                                        <span className="text-[8px] bg-slate-100 px-2 py-1 rounded-full font-bold text-slate-500 uppercase">{v.properties?.sentido || 'N/A'}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 opacity-30 text-center"><Bus size={32} /><p className="text-[10px] font-medium mt-2 italic uppercase">Nenhum veículo agora</p></div>
                            )}
                        </div>
                    )}

                    {abaPrincipal === 'INFORMACOES' && (
                        <div className="space-y-4 animate-fadeIn text-slate-700">
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-tighter">Descrição da Linha</p>
                                <p className="text-xs font-medium leading-relaxed uppercase">{dadosLinha?.descricao || 'Não informada'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Tarifa</p>
                                    <p className="text-sm font-bold text-blue-600">R$ {dadosLinha?.tarifa ? Number(dadosLinha.tarifa).toFixed(2) : '0,00'}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Tipo</p>
                                    <p className="text-[10px] font-bold text-slate-700 uppercase leading-none mt-1">{dadosLinha?.faixatarifaria || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center gap-3">
                                <div className="bg-amber-100 p-2 rounded-xl text-amber-600"><Landmark size={20}/></div>
                                <div className="flex flex-col">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Operadora Responsável</p>
                                    <p className="text-[11px] font-bold text-slate-700 uppercase leading-tight">{dadosLinha?.operadora || 'N/A'}</p>
                                </div>
                            </div>
                            {/* Botão Consultar OS */}
                            <button
                                disabled={redirecionando}
                                onClick={async () => {
                                    if (redirecionando) return;
                                    setRedirecionando(true);
                                    
                                    try {
                                        let siglaOperadora = dadosLinha?.operadorasigla || dadosLinha?.sigla_operadora;
                                        const dtRef = new Date().toISOString().split('T')[0];

                                        if (!siglaOperadora && dadosLinha?.numero) {
                                            try {
                                                const BASE_URL_LEGACY = import.meta.env.VITE_API_URL_LEGACY;
                                                const res = await fetch(`${BASE_URL_LEGACY}/OS/Linhas/Listar?dt_ref=${dtRef}`, {
                                                    headers: { 'ngrok-skip-browser-warning': 'true' }
                                                });
                                                if (res.ok) {
                                                    const dadosApi = await res.json();
                                                    const linhaRetornada = dadosApi.find((d: any) => 
                                                        d.CódigoLinha === dadosLinha.numero && 
                                                        d.NomeOperadora === dadosLinha.operadora
                                                    );
                                                    if (linhaRetornada && linhaRetornada.SiglaOperadora) {
                                                        siglaOperadora = linhaRetornada.SiglaOperadora;
                                                    }
                                                }
                                            } catch (e) {
                                                console.error("Falha ao buscar sigla via API", e);
                                            }
                                        }

                                        if (!siglaOperadora && dadosLinha?.operadora) {
                                            const nome = dadosLinha.operadora.toUpperCase();
                                            if (nome.includes('PIONEIRA')) siglaOperadora = 'VP';
                                            else if (nome.includes('URBI')) siglaOperadora = 'UR';
                                            else if (nome.includes('MARECHAL')) siglaOperadora = 'VM';
                                            else if (nome.includes('PIRACICABANA')) siglaOperadora = 'PB';
                                            else if (nome.includes('SÃO JOSÉ') || nome.includes('SAO JOSE')) siglaOperadora = 'SJ';
                                            else if (nome.includes('BSB')) siglaOperadora = 'BSB';
                                            else if (nome.includes('TCB')) siglaOperadora = 'TCB';
                                            else siglaOperadora = dadosLinha.operadora;
                                        }

                                        const payload = {
                                            codigo: dadosLinha?.numero || '',
                                            empresa: siglaOperadora || '',
                                            data: dtRef,
                                        };
                                        sessionStorage.setItem('@SISMOB:consultaos_prefill', JSON.stringify(payload));
                                        navegarPara('consultaos' as any);
                                    } finally {
                                        setRedirecionando(false);
                                    }
                                }}
                                className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-200 disabled:opacity-50"
                            >
                                <FileSearch size={15} />
                                {redirecionando ? 'Mapeando Dados...' : 'Consultar Ordem de Serviço'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
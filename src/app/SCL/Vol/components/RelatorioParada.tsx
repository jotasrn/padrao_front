import { ParadaGeo } from '../services/paradaService';
import { Download } from 'lucide-react';

interface RelatorioParadaProps {
  parada: ParadaGeo;
  linhas: string[];
  onClose: () => void;
}

export function RelatorioParada({ parada, linhas, onClose }: RelatorioParadaProps) {
  const hoje = new Date().toLocaleDateString('pt-BR');
  const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const handleDownloadCSV = () => {
    const header = "COD_PARADA;ENDERECO;REGIAO;SENTIDO;LOCAL_PONTO;N_LINHA;DESCRICAO_OPERACAO;OBSERVACAO\n";
    
    const stopCod = parada.properties.codParada || '';
    const stopEnder = parada.properties.endereco || 'NAO INFORMADO';
    const stopRegiao = parada.properties.regiao || 'DISTRITO FEDERAL';
    const stopSentido = parada.properties.sentido || 'NAO INFORMADO';
    const stopLocal = parada.properties.nomeAbrigo || 'ABRIGO PONTUADO';

    let rows = "";
    if (linhas.length > 0) {
      rows = linhas.map(l => {
        const numero = l.split(' - ')[0];
        return `"${stopCod}";"${stopEnder}";"${stopRegiao}";"${stopSentido}";"${stopLocal}";"${numero}";"${l}";"Vigente"`;
      }).join("\n");
    } else {
      // Exporta a parada mesmo sem linha
      rows = `"${stopCod}";"${stopEnder}";"${stopRegiao}";"${stopSentido}";"${stopLocal}";"N/A";"NENHUMA LINHA REGISTRADA";"N/A"`;
    }
    
    const csvContent = "\ufeff" + header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_parada_${parada.properties.codParada}_${hoje.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderHeader = () => (
    <header className="flex justify-between items-center border border-black p-2 mb-4">
      <div className="flex flex-col font-bold text-[8pt]">
        <span>Secretaria de Transporte e Mobilidade</span>
        <span>GDF</span>
        <span>SBA - Sistema de Bilhetagem Automática</span>
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold uppercase">Relatório de Linhas por Parada</h1>
        <p className="text-[10pt] font-black underline">PONTO: {parada.properties.codParada}</p>
      </div>
      <div className="text-right text-[8pt]">
        <p>Emissão: {hoje}</p>
        <p>Hora: {hora}</p>
        <div className="border-t border-black mt-1 pt-1 font-bold">
            SUTINF/SEMOB
        </div>
      </div>
    </header>
  );

  return (
    <div className="fixed inset-0 z-[11000] flex flex-col items-center bg-slate-900/90 overflow-y-auto p-4 md:p-8 no-scrollbar print:relative print:block print:w-full print:h-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:shadow-none">
      
      {/* Botões de Ação (Escondidos na Impressão) */}
      <div className="flex gap-4 mb-4 shrink-0 print:hidden">
        <button 
          onClick={handleDownloadCSV}
          className="bg-emerald-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <Download size={14} /> Baixar CSV
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-sky-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg hover:bg-sky-700 transition-all"
        >
          Imprimir Relatório
        </button>
        <button 
          onClick={onClose}
          className="bg-white text-slate-900 px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg hover:bg-slate-100 transition-all"
        >
          Fechar Visualização
        </button>
      </div>

      {/* Folha A4 */}
      <div className="bg-white text-black p-[15mm] max-w-[210mm] w-full min-h-[297mm] h-max shrink-0 flex flex-col shadow-2xl mx-auto text-[9pt] font-sans leading-tight box-border print:shadow-none print:m-0 print:p-[10mm] print:h-auto print:min-h-0 print:w-full print:max-w-none">
        
        {renderHeader()}

        <div className="border border-black mb-4 break-inside-avoid">
          <div className="grid grid-cols-12 gap-0 w-full table-fixed">
            <div className="col-span-2 border-r border-b border-black p-2 font-bold bg-gray-100">CÓDIGO:</div>
            <div className="col-span-10 border-b border-black p-2 font-bold uppercase break-words">{parada.properties.codParada}</div>

            <div className="col-span-2 border-r border-b border-black p-2 font-bold bg-gray-100">LOGRADOURO:</div>
            <div className="col-span-10 border-b border-black p-2 uppercase break-words">{parada.properties.endereco || 'NÃO INFORMADO'}</div>

            <div className="col-span-2 border-r border-b border-black p-2 font-bold bg-gray-100">REGIÃO:</div>
            <div className="col-span-4 border-r border-b border-black p-2 uppercase break-words">{parada.properties.regiao || 'DISTRITO FEDERAL'}</div>
            
            <div className="col-span-2 border-r border-b border-black p-2 font-bold bg-gray-100">SENTIDO:</div>
            <div className="col-span-4 border-b border-black p-2 uppercase break-words">{parada.properties.sentido || 'NÃO INFORMADO'}</div>

            <div className="col-span-2 border-r border-black p-2 font-bold bg-gray-100">LOCAL:</div>
            <div className="col-span-10 p-2 uppercase text-[8pt] italic text-gray-600 break-words">{parada.properties.nomeAbrigo || 'ABRIGO PONTUADO'}</div>
          </div>
        </div>

        <div className="border border-black">
          <div className="bg-gray-200 border-b border-black p-1.5 font-bold text-center uppercase tracking-widest text-[10pt]">
            Lista de Linhas Atendidas no Ponto
          </div>
          <table className="w-full text-center text-[7pt] md:text-[8pt] table-fixed border-collapse">
            <thead>
              <tr className="border-b border-black font-black bg-gray-50 h-8">
                <th className="border-r border-black w-[20%]">Nº LINHA</th>
                <th className="border-r border-black w-[55%]">DESCRIÇÃO DA OPERAÇÃO</th>
                <th className="w-[25%]">OBSERVAÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {linhas.length > 0 ? linhas.map((l, i) => (
                <tr key={i} className="border-b border-gray-300 h-8 break-inside-avoid">
                  <td className="border-r border-black font-black text-blue-900 break-words px-1">{l.split(' - ')[0]}</td>
                  <td className="border-r border-black text-left pl-2 pr-1 uppercase font-medium break-words leading-tight py-1">{l}</td>
                  <td className="italic text-gray-400 text-[6pt] px-1 break-words">Vigente</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="p-10 text-gray-400 italic">Nenhuma linha registrada para este ponto de parada.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 border border-black p-4 text-[8pt] text-justify leading-relaxed">
          <p className="font-bold mb-2">NOTAS TÉCNICAS:</p>
          <p>
            Este relatório consolida todas as permissões de operação que utilizam este ponto de parada como local de embarque e desembarque oficial, conforme registros nos sistemas geográficos da Secretaria de Transporte e Mobilidade. A alteração ou remoção de qualquer linha listada acima deve ser precedida de ordem de serviço específica emitida pela diretoria técnica competente.
          </p>
        </div>

        <div className="mt-12 flex justify-around items-end">
            <div className="text-center w-48 border-t border-black pt-1">
                <p className="font-bold text-[7pt]">DIPRO/SEMOB</p>
                <p className="text-[6pt]">Gestão de Projetos</p>
            </div>
            <div className="text-center w-48 border-t border-black pt-1">
                <p className="font-bold text-[7pt]">SUTINF/SEMOB</p>
                <p className="text-[6pt]">Secretaria de Tecnologia</p>
            </div>
        </div>

        <div className="mt-auto pt-16 text-center">
          <p className="italic font-bold text-[7pt] text-gray-400">
            Relatório gerado automaticamente pelo Módulo Infoônibus - SBA (Sistema de Bilhetagem Automática)
          </p>
        </div>
      </div>

    </div>
  );
}

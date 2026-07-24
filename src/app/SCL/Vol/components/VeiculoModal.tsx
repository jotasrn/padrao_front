import React from 'react';
import { Bus, Gauge, MapPin, Clock, Building2 } from 'lucide-react';

interface VeiculoModalProps {
  veiculo: any;
  onClose: () => void;
}

export const VeiculoModal: React.FC<VeiculoModalProps> = ({ veiculo, onClose }) => {
  if (!veiculo) return null;

  const { properties, geometry } = veiculo;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-scaleIn">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-medium text-slate-800">
              Veículo {properties.prefixo}
            </h2>
          </div>

          <div className="space-y-5 text-slate-600">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 mt-0.5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Operadora:</p>
                <p className="text-sm">{properties.operadora}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Bus className="w-5 h-5 mt-0.5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Código da Linha:</p>
                <p className="text-sm">{properties.linha}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Gauge className="w-5 h-5 mt-0.5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Velocidade:</p>
                <p className="text-sm">{properties.velocidade} km/h</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-0.5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Última atualização:</p>
                <p className="text-sm">{properties.data}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 mt-0.5 text-slate-400" />
              <div>
                <p className="text-sm font-medium">Coordenadas:</p>
                <p className="text-sm">{geometry.coordinates[1].toFixed(6)}, {geometry.coordinates[0].toFixed(6)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t pt-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
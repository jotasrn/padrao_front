import api from './api';

export const OPERADORAS = [
  { id: 'urbi', nome: 'Urbi' },
  { id: 'piracicabana', nome: 'Piracicabana' },
  { id: 'pioneira', nome: 'Pioneira' },
  { id: 'marechal', nome: 'Marechal' },
  { id: 'bsbus', nome: 'São José (BsBus)' }
];

export interface VeiculoPosicao {
  prefixo: string;
  linha: string;
  latitude: number;
  longitude: number;
  direcao: number;
  velocidade: number;
  data: string;
  operadora: string;
}

export const mapaService = {
  async buscarTodasPosicoes(): Promise<VeiculoPosicao[]> {
    const promises = OPERADORAS.map(async (op) => {
      try {
        const response = await api.get(`/posicao/${op.id}`);
        const data = response.data;

        // A API retorna um array de FeatureCollections (geralmente [0] é o que importa)
        // O formato esperado pelo usuário: response.data[0].features
        const collection = Array.isArray(data) ? data[0] : data;
        
        if (!collection || !collection.features) return [];

        return collection.features.map((f: any) => ({
          prefixo: f.properties.veiculo.prefixo,
          linha: f.properties.veiculo.numero || 'N/A',
          latitude: f.geometry.coordinates[1],
          longitude: f.geometry.coordinates[0],
          direcao: parseFloat(f.properties.direcao),
          velocidade: parseFloat(f.properties.velocidade),
          data: f.properties.datalocal,
          operadora: op.nome
        }));
      } catch (error) {
        console.error(`Erro ao carregar operadora ${op.id}:`, error);
        return [];
      }
    });

    const resultados = await Promise.all(promises);
    return resultados.flat();
  }
};

import api from './api';

export const veiculosService = {
  // Substitui VeiculosService.buscarUltimaPosicao (Converte para GeoJSON manual)
  buscarPosicaoPorLinha: async (numero: string) => {
    const response = await api.get(`/recente/${numero}`);
    const jsonData = response.data;

    return {
      type: 'FeatureCollection',
      features: jsonData.map((data: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(data.longitude), Number(data.latitude)],
        },
        properties: {
          operadora: data.nm_operadora,
          prefixo: data.prefixo,
          data: data.datalocal,
          velocidade: data.velocidade,
          linha: data.cd_linha,
          direcao: data.direcao,
          sentido: data.sentido,
        },
      })),
    };
  },

  // Unifica Bsbus, Marechal, Pioneira, Piracicabana, Urbi
  buscarPosicaoPorOperadora: async (operadora: 'bsbus' | 'marechal' | 'pioneira' | 'piracicabana' | 'urbi') => {
    try {
      const response = await api.get(`/posicao/${operadora}`);
      // No Flutter você buscava a primeira FeatureCollection, aqui fazemos o mesmo
      const collection = response.data.find((item: any) => item.type === 'FeatureCollection');
      return collection || { type: 'FeatureCollection', features: [] };
    } catch (error) {
      console.error(`Erro ao buscar posição da operadora ${operadora}`, error);
      return { type: 'FeatureCollection', features: [] };
    }
  }
};
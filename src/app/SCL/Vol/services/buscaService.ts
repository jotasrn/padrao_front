import api from './api';

export const buscaService = {
  buscarSugestoes: async (query: string, limite = 10) => {
    if (!query.trim()) return [];

    try {
      const response = await api.get(`/numeros/find/${query.trim()}/${limite}`);
      const data = response.data;

      if (!Array.isArray(data)) return [];

      // Lógica de filtragem igual ao seu Flutter: 
      // Remove duplicados e prioriza IDA ou CIRCULAR
      const vistos = new Set();
      return data.filter((item: any) => {
        const numero = item.numero?.toString();
        const sentido = item.sentido?.toString();

        if (numero && sentido && !vistos.has(numero) && (sentido === 'IDA' || sentido === 'CIRCULAR')) {
          vistos.add(numero);
          return true;
        }
        return false;
      });
    } catch (error) {
      console.error("Erro ao buscar sugestões", error);
      return [];
    }
  }
};
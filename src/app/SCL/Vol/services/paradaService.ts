import axios from 'axios';

// Cache em memória para evitar downloads repetidos do GeoJSON (que é grande)
let cacheGeoParadas: any = null;
let cacheRelacaoParadas: any = null;

// Usamos o prefixo do PROXY local (configurado no vite.config.ts) para evitar erros de CORS
const DADOS_BASE_URL = import.meta.env.VITE_API_PARADAS_URL || 'https://dados.semob.df.gov.br';

export interface ParadaGeo {
  type: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    codParada: number;
    regiao?: string;
    nomeAbrigo?: string;
    endereco: string;
    sentido?: string;
  };
}

export interface ParadaRelacao {
  codParada: number;
  linParadaSentido: string[]; // Ex: ["0.782 - IDA", "0.782 - VOLTA"]
}

export const paradaService = {
  /**
   * Busca todas as paradas geográficas (GeoJSON)
   */
  async buscarGeoParadas(): Promise<any> {
    if (cacheGeoParadas) return cacheGeoParadas;
    try {
      const response = await fetch(`${DADOS_BASE_URL}/parada/geojson/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      cacheGeoParadas = await response.json();
      return cacheGeoParadas;
    } catch (error) {
      console.error("Erro ao carregar GeoJSON de paradas:", error);
      return { type: "FeatureCollection", features: [] };
    }
  },

  /**
   * Busca a relação completa de paradas e suas linhas
   */
  async buscarRelacaoParadas(): Promise<ParadaRelacao[]> {
    if (cacheRelacaoParadas) return cacheRelacaoParadas;
    try {
      const response = await fetch(`${DADOS_BASE_URL}/parada/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      cacheRelacaoParadas = await response.json();
      return cacheRelacaoParadas;
    } catch (error) {
      console.error("Erro ao carregar relação de paradas:", error);
      return [];
    }
  },

  /**
   * Filtra as paradas de uma linha específica e sentido
   */
  async buscarParadasPorLinha(numero: string, sentido: string): Promise<ParadaGeo[]> {
    try {
      const [geo, rel] = await Promise.all([
        this.buscarGeoParadas(),
        this.buscarRelacaoParadas()
      ]);

      // PROTEÇÃO CRÍTICA: Garante que 'rel' seja um array. 
      // Em alguns builds, se a API falhar ou retornar um objeto de erro inesperado, o .filter quebraria.
      const relArray = Array.isArray(rel) ? rel : [];
      
      if (relArray.length === 0) {
        console.warn("[INFOONIBUS] Relação de paradas vazia ou formato inválido recebido da API.");
        return [];
      }

      const termoBusca = `${numero.toString().trim()} - ${sentido.trim()}`.toUpperCase();
      console.log(`[INFOONIBUS] Filtrando paradas por: "${termoBusca}"`);
      
      // 1. Encontra os códigos das paradas que atendem esta linha/sentido
      const codigosFiltro = relArray
        .filter((item: any) => {
          // Verifica se item existe e tem a propriedade necessária antes de filtrar
          if (!item || !item.linParadaSentido) return false;
          
          const sentidos = item.linParadaSentido;
          if (Array.isArray(sentidos)) {
            return sentidos.some((s: string) => s?.toUpperCase().trim() === termoBusca);
          }
          return String(sentidos).toUpperCase().includes(termoBusca);
        })
        .map((item: any) => item.codParada);

      // 2. Filtra as features geográficas correspondentes com segurança
      const features = geo?.features || [];
      const filtradas = features.filter((f: any) => codigosFiltro.includes(f.properties?.codParada));
      
      // 3. Deduplicar por codParada (Evita erro de Duplicate Keys no React)
      const uniqueFiltradas = Array.from(new Map(filtradas.map((f: any) => [f.properties.codParada, f])).values()) as ParadaGeo[];
      
      console.log(`[INFOONIBUS] Encontradas ${uniqueFiltradas.length} paradas únicas para ${termoBusca}`);
      return uniqueFiltradas;
      
    } catch (error) {
      console.error("[INFOONIBUS] Erro crítico no processamento de paradas por linha:", error);
      return [];
    }
  },

  /**
   * Busca todas as linhas que passam em uma parada específica
   */
  async buscarLinhasPorParada(codParada: number): Promise<string[]> {
    const rel = await this.buscarRelacaoParadas();
    const parada = rel.find(r => r.codParada === codParada);
    return parada?.linParadaSentido || [];
  }
};

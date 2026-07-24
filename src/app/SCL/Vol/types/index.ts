export type ModoMapa = 'VEICULOS' | 'PARADAS';

export interface MapaOperacionalProps {
  onVoltar: () => void;
  sidebarAberta?: boolean;
}

export interface ClusterInfo {
  lat: number;
  lng: number;
  count: number;
  ids: string[];
}

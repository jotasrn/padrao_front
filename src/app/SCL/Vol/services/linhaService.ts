import api from './api';

export const linhaService = {
  // Substitui LinhaInfoService.procurarLinha
  buscarInformacoes: async (numero: string) => {
    const response = await api.get(`/numeros/${numero}`);
    return response.data;
  },

  // Substitui PercursoService.buscarPercursos
  buscarPercursos: async (numero: string) => {
    const response = await api.get(`/espaciais/${numero}`);
    const data = response.data;

    return {
      IDA: data.filter((item: any) => item.Sentido === 'IDA'),
      VOLTA: data.filter((item: any) => item.Sentido === 'VOLTA'),
      CIRCULAR: data.filter((item: any) => item.Sentido === 'CIRCULAR'),
    };
  },

  // Substitui ItinerarioService.procurarItinerario
  buscarItinerarioDescritivo: async (numero: string) => {
    const response = await api.get(`/descritivo/${numero}`);
    return response.data;
  },

  // Substitui HorarioService.procurarHorarios
  buscarHorarios: async (numero: string) => {
    const response = await api.get(`/horario/${numero}`);
    return response.data;
  }
};
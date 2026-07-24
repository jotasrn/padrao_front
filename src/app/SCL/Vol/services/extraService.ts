import api from './api';

export const extraService = {
  buscarNoticias: async () => {
    try {
      const response = await api.get('/noticias');
      return response.data.map((n: any) => ({
        id: n.id_noticias,
        titulo: n.titulo,
        descricao: n.descricao,
        link: n.link,
        img: n.linkImagem
      }));
    } catch {
      return [];
    }
  },

  // Substitui Uint8List do Flutter por um Blob URL no React
  carregarImagemProtegida: async (url: string) => {
    try {
      const response = await api.get(url, { responseType: 'blob' });
      return URL.createObjectURL(response.data);
    } catch {
      return null;
    }
  }
};
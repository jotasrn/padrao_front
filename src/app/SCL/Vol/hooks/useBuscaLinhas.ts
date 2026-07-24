import { useState, useEffect } from 'react';
import { buscaService } from '../services/buscaService';

export function useBuscaLinhas() {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Se a query for pequena, limpa os resultados e não dispara API
    if (query.trim().length < 2) {
      setResultados([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setErro(null);
      try {
        const data = await buscaService.buscarSugestoes(query);
        setResultados(data || []);
      } catch (err) {
        setErro("Falha ao buscar linhas.");
        setResultados([]);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms de debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return { query, setQuery, resultados, loading, erro };
}
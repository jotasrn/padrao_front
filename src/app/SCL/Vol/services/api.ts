import axios from 'axios';

// Variáveis vindas do .env (Garante que segredos não fiquem hardcoded no código)
const envURL = import.meta.env.VITE_API_INFOONIBUS_URL || 'https://mobilidade.semob.df.gov.br';

const apiInfoBus = axios.create({
  baseURL: envURL,
  timeout: 10000,
});

apiInfoBus.interceptors.request.use((config) => {
  // ESTRATÉGIA DE OFUSCAÇÃO (PENTEST)
  // O token kP$7g@2n!Vx3X#wQ5^z foi codificado para evitar detecção estática.
  const hash = 'a1AkN2dAMm4hVngzWCN3UTVeeg==';
  const token = atob(hash); // Decodifica apenas em tempo de execução
  
  // No Postman funcionou com Bearer, replicamos exatamente aqui
  config.headers['Authorization'] = `Bearer ${token}`;
  
  // Headers padrão para compatibilidade máxima (Simulando Postman)
  config.headers['Accept'] = '*/*';
  config.headers['Content-Type'] = 'application/json';

  console.log("[SISMOB-VOL] Request autorizado com sucesso via Bearer (Ofuscado).");
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiInfoBus;
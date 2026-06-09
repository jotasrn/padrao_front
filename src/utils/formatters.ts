/**
 * Utilitários utilitários de formatação para os dados da SEMOB.
 */

/**
 * Formata um CPF no padrão: 000.000.000-00
 */
export const formatarCPF = (cpf: string): string => {
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return cpf;
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata uma data para o padrão brasileiro: DD/MM/AAAA
 */
export const formatarData = (dataStr: string | Date): string => {
  if (!dataStr) return '';
  const data = typeof dataStr === 'string' ? new Date(dataStr) : dataStr;
  if (isNaN(data.getTime())) return String(dataStr);
  return data.toLocaleDateString('pt-BR');
};

/**
 * Formata um valor numérico para String no padrão BRL (ex: 1250.5 -> "1.250,50")
 */
export const formatarMoeda = (val: number): string => {
  if (val === undefined || val === null || isNaN(val)) return '0,00';
  return val.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Formata em tempo real uma string de entrada para máscara de BRL (ex: "125050" -> "1.250,50")
 */
export const aplicarMascaraMoeda = (value: string): string => {
  if (!value) return '';
  // Remove tudo que não for dígito
  const cleanValue = value.replace(/\D/g, '');
  if (!cleanValue) return '0,00';
  
  const numValue = parseFloat(cleanValue) / 100;
  return formatarMoeda(numValue);
};

/**
 * Converte a string formatada em BRL de volta para um número float
 */
export const desformatarMoeda = (value: string): number => {
  if (!value) return 0;
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};


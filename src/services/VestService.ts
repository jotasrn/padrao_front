import { VestData } from '../types';

const STORAGE_KEY = 'vest_financial_data';

const DEFAULT_DATA: VestData = {
  salary: {
    salario: 0,
    diaRecebimento: 5,
  },
  expenses: [],
  caixinhas: [],
  goals: []
};

export class VestService {
  /**
   * Obtém os dados de planejamento financeiro salvos no LocalStorage.
   * Se não houver dados, retorna os dados padrão.
   */
  public static getFinancialData(): VestData {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);
      if (!dataStr) {
        this.saveFinancialData(DEFAULT_DATA);
        return DEFAULT_DATA;
      }
      const parsed: VestData = JSON.parse(dataStr);
      
      // Auto-migração de Caixinhas antigas que não possuem rendimentoCdiPct
      let needsSave = false;
      if (parsed.caixinhas) {
        parsed.caixinhas = parsed.caixinhas.map((cx: any) => {
          if (cx.rendimentoCdiPct === undefined || isNaN(cx.rendimentoCdiPct)) {
            needsSave = true;
            let defaultCdi = 100;
            if (cx.nome?.toLowerCase()?.includes('turbo')) {
              defaultCdi = 112; // Padrão Turbo
            }
            return {
              ...cx,
              rendimentoCdiPct: defaultCdi
            };
          }
          return cx;
        });
      }

      if (needsSave) {
        this.saveFinancialData(parsed);
      }

      return parsed;
    } catch (error) {
      console.error('Erro ao ler dados do localStorage:', error);
      return DEFAULT_DATA;
    }
  }

  /**
   * Salva os dados de planejamento financeiro no LocalStorage.
   */
  public static saveFinancialData(data: VestData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  }

  /**
   * Limpa os dados salvos e reseta para o padrão.
   */
  public static resetData(): VestData {
    this.saveFinancialData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }
}
export default VestService;

import { useState, useEffect } from 'react';
import { detectIncognito } from 'detectincognitojs';

export function useIncognitoBlocker() {
  const [isIncognito, setIsIncognito] = useState<boolean | null>(null);

  useEffect(() => {
    detectIncognito().then((result) => {
      setIsIncognito(result.isPrivate);
    }).catch((err) => {
      console.warn("[Incognito] Erro ao detectar navegação anônima:", err);
      // Em caso de erro obscuro, permitimos o acesso para não inutilizar a aplicação para usuários normais
      setIsIncognito(false);
    });
  }, []);

  return { isIncognito };
}

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View } from 'react-native';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: { name: string; role: string } | null;
  login: (name: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [user, setUser] = useState<{ name: string; role: string } | null>({
    name: 'Desenvolvedor SEMOB',
    role: 'Administrador'
  });

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const login = (name: string) => setUser({ name, role: 'Desenvolvedor' });
  const logout = () => setUser(null);

  return (
    <AppContext.Provider value={{ theme, toggleTheme, user, login, logout }}>
      <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#080b14' : '#f8fafc' }}>
        {children}
      </View>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de um AppProvider');
  return context;
};

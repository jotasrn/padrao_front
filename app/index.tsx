import React from 'react';
import VestDashboard from '../src/screens/VestDashboard';
import LoginScreen from '../src/screens/LoginScreen';
import { useAuthStore } from '../src/store/useAuthStore';

export default function Index() {
  const autenticado = useAuthStore((state) => state.autenticado);

  if (!autenticado) {
    return <LoginScreen />;
  }

  return <VestDashboard />;
}

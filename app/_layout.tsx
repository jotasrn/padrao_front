import { Stack } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/context/AppProvider';
import { useAuthStore } from '../src/store/useAuthStore';

export default function RootLayout() {
  const { lockApp, lastActiveTime, setLastActiveTime, autenticado } = useAuthStore();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        if (autenticado && lastActiveTime > 0) {
          const elapsed = Date.now() - lastActiveTime;
          if (elapsed > 60000) {
            lockApp();
          }
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        setLastActiveTime(Date.now());
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [autenticado, lastActiveTime]);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}

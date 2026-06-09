import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Animated, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Fingerprint, Lock, ShieldCheck } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useApp } from '../context/AppProvider';

export default function LoginScreen() {
  const { unlockApp, setBiometriaSuportada } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const { theme } = useApp();

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#080b14' : '#f8fafc';
  const textPrimary = isDark ? 'white' : '#0f172a';
  const textSecondary = isDark ? '#94a3b8' : '#475569';
  const buttonBg = isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)';
  const buttonBorder = isDark ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.2)';

  useEffect(() => {
    checkBiometrics();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometriaSuportada(compatible && enrolled);
    
    if (compatible && enrolled) {
      handleAuthentication();
    }
  };

  const handleAuthentication = async () => {
    if (Platform.OS === 'web') {
      unlockApp();
      return;
    }
    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Acesse o Vest Finance',
        fallbackLabel: 'Usar senha do celular',
        disableDeviceFallback: false,
      });

      if (result.success) {
        unlockApp();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar a autenticação.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bgColor} />
      
      <View style={{ alignItems: 'center', marginBottom: 60 }}>
        <View style={{
          width: 80, height: 80, borderRadius: 24,
          backgroundColor: '#6366f1',
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#6366f1', shadowOpacity: 0.7, shadowRadius: 20, elevation: 12,
          marginBottom: 20
        }}>
          <ShieldCheck size={40} color="white" />
        </View>
        <Text style={{ color: textPrimary, fontWeight: '900', fontSize: 28, letterSpacing: -0.5 }}>
          vest
        </Text>
        <Text style={{ color: '#6366f1', fontSize: 12, fontWeight: '700', letterSpacing: 4 }}>
          FINANCE
        </Text>
      </View>

      <Text style={{ color: textSecondary, fontSize: 16, textAlign: 'center', paddingHorizontal: 40, marginBottom: 40 }}>
        Protegendo seu patrimônio. Confirme sua identidade para acessar.
      </Text>

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          onPress={handleAuthentication}
          disabled={isAuthenticating}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: buttonBg,
            borderWidth: 1, borderColor: buttonBorder,
            paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16,
          }}
        >
          <Fingerprint size={24} color="#818cf8" />
          <Text style={{ color: textPrimary, fontWeight: '700', fontSize: 16 }}>
            {isAuthenticating ? 'Verificando...' : 'Acessar App'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

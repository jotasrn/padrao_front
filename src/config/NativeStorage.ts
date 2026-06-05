import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Abstração nativa para armazenamento persistente.
 * Usa AsyncStorage no React Native (Expo).
 */
export const NativeStorage = {
  isNative(): boolean {
    return true; // We are always native now
  },

  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error('Error reading value', e);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('Error saving value', e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing value', e);
    }
  }
};

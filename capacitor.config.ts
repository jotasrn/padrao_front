import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.gov.df.semob.vest',
  appName: 'vest-finance',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

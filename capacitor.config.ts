import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'surebankstores.ng',
  appName: 'SureBank',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*']
  },
  plugins: {
    App: {
      appUrlOpen: {
        enabled: true
      }
    },
    CapacitorHttp: {
      enabled: true
    }
  },
  ios: {
    scheme: 'surebank',
    contentInset: 'automatic'
  },
  android: {
    backgroundColor: "#ffffff"
  }
};

export default config;

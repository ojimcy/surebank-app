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
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0066A1',
      overlaysWebView: false
    }
  },
  ios: {
    scheme: 'surebank',
    contentInset: 'automatic'
  },
  android: {
    backgroundColor: "#0066A1"
  }
};

export default config;

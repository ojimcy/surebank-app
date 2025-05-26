import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'surebankstores.ng',
  appName: 'SureBank',
  webDir: 'dist',
  server: {
    allowNavigation: [
      'https://checkout.paystack.com',
      'https://19igw0ftch.execute-api.us-east-2.amazonaws.com',
      'https://api.paystack.co'
    ]
  },
  android: {
    allowMixedContent: false,
    captureInput: true
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;

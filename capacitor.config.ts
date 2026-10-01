import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'shop.gestora.app',
  appName: 'Gestora',
  webDir: 'public',
  bundledWebRuntime: false,
  server: {
    url: 'https://gestora.shop',
    cleartext: true
  }
};

export default config;

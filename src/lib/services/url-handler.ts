import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export class UrlHandler {
  static initialize() {
    if (Capacitor.isNativePlatform()) {
      App.addListener('appUrlOpen', (event) => {
        this.handleUrl(event.url);
      });
    }
  }

  private static handleUrl(url: string) {
    console.log('Received URL:', url);
    
    // Parse the URL
    const urlObj = new URL(url);
    
    if (urlObj.protocol === 'surebank:') {
      const path = urlObj.pathname;
      const searchParams = urlObj.searchParams;
      
      // Handle payment redirects
      if (path.startsWith('/payment')) {
        if (path.includes('/success')) {
          this.handlePaymentSuccess(searchParams);
        } else if (path.includes('/error')) {
          this.handlePaymentError(searchParams);
        }
      }
    }
  }

  private static handlePaymentSuccess(params: URLSearchParams) {
    const reference = params.get('reference');
    const status = params.get('status');
    
    // Navigate to success page with parameters
    const currentPath = window.location.pathname;
    if (currentPath !== '/payments/success') {
      window.history.pushState({}, '', `/payments/success?reference=${reference}&status=${status}`);
      // Trigger a custom event to update the app
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private static handlePaymentError(params: URLSearchParams) {
    const reference = params.get('reference');
    const message = params.get('message');
    
    // Navigate to error page with parameters
    const currentPath = window.location.pathname;
    if (currentPath !== '/payments/error') {
      window.history.pushState({}, '', `/payments/error?reference=${reference}&message=${message}`);
      // Trigger a custom event to update the app
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }
} 
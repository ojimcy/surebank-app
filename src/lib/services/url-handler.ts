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
      
      // Handle payment callback from new unified API
      if (path.startsWith('/payment/callback')) {
        const reference = searchParams.get('reference');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        
        if (status === 'success') {
          this.handlePaymentSuccess(reference, type);
        } else {
          this.handlePaymentFailure(reference, type);
        }
      }
      // Legacy payment redirect handling (for backward compatibility)
      else if (path.startsWith('/payment')) {
        if (path.includes('/success')) {
          this.handlePaymentSuccess(searchParams.get('reference'));
        } else if (path.includes('/error')) {
          this.handlePaymentError(searchParams);
        }
      }
    }
  }

  private static handlePaymentSuccess(reference: string | null, type?: string | null) {
    if (!reference) {
      console.error('Payment success callback missing reference');
      return;
    }
    
    // Navigate to success page with parameters
    const currentPath = window.location.pathname;
    if (currentPath !== '/payments/success') {
      let successUrl = `/payments/success?reference=${reference}&status=success`;
      if (type) {
        successUrl += `&type=${type}`;
      }
      
      window.history.pushState({}, '', successUrl);
      // Trigger a custom event to update the app
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private static handlePaymentFailure(reference: string | null, type?: string | null) {
    if (!reference) {
      console.error('Payment failure callback missing reference');
      return;
    }
    
    // Navigate to error page with parameters
    const currentPath = window.location.pathname;
    if (currentPath !== '/payments/error') {
      let errorUrl = `/payments/error?reference=${reference}&status=failure`;
      if (type) {
        errorUrl += `&type=${type}`;
      }
      
      window.history.pushState({}, '', errorUrl);
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
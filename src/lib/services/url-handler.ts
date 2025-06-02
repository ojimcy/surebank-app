import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { logger } from '@/lib/utils/logger';

// Create a logger for URL handling
const urlLogger = logger.create('URLHandler');

export class UrlHandler {
  static initialize() {
    if (Capacitor.isNativePlatform()) {
      urlLogger.info('Initializing URL handler for native platform');
      App.addListener('appUrlOpen', (event) => {
        urlLogger.info(`App opened with URL: ${event.url}`);
        this.handleUrl(event.url);
      });
    }
  }

  private static handleUrl(url: string) {
    urlLogger.info('Processing URL:', url);
    
    try {
      // Parse the URL
      const urlObj = new URL(url);
      urlLogger.debug('Parsed URL:', {
        protocol: urlObj.protocol,
        pathname: urlObj.pathname,
        search: urlObj.search
      });
      
      if (urlObj.protocol === 'surebank:') {
        // Extract path and search parameters
        const path = urlObj.pathname;
        const searchParams = new URLSearchParams(urlObj.search);
        
        // New format: surebank://navigate?action=navigate&route=/payments/success&reference=123
        if (path === '/navigate' || path === '//navigate') {
          const action = searchParams.get('action');
          const route = searchParams.get('route');
          
          urlLogger.info(`Navigate action: ${action}, route: ${route}`);
          
          if (action === 'navigate' && route) {
            if (route.includes('/payments/success')) {
              this.handlePaymentSuccess(searchParams);
            } else if (route.includes('/payments/error')) {
              this.handlePaymentError(searchParams);
            } else {
              // Navigate to the specified route
              this.navigateToRoute(route, searchParams);
            }
          }
        }
        // Legacy format: surebank://payments/success?reference=123
        else if (path.startsWith('/payment') || path.startsWith('//payment')) {
          urlLogger.info('Handling legacy payment URL format');
          
          if (path.includes('/success')) {
            this.handlePaymentSuccess(searchParams);
          } else if (path.includes('/error')) {
            this.handlePaymentError(searchParams);
          }
        }
      }
    } catch (error) {
      urlLogger.error('Error processing URL:', error);
    }
  }

  private static navigateToRoute(route: string, params: URLSearchParams) {
    urlLogger.info(`Navigating to route: ${route}`);
    
    // Construct the full path with parameters
    let path = route;
    const queryParams = new URLSearchParams();
    
    // Add all relevant parameters to the query
    params.forEach((value, key) => {
      // Skip the action and route parameters
      if (key !== 'action' && key !== 'route') {
        queryParams.append(key, value);
      }
    });
    
    // Add query parameters if any exist
    const queryString = queryParams.toString();
    if (queryString) {
      path += `?${queryString}`;
    }
    
    urlLogger.info(`Final navigation path: ${path}`);
    
    // Navigate to the path if not already there
    if (window.location.pathname !== route) {
      window.history.pushState({}, '', path);
      // Trigger a popstate event to make the router handle the navigation
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private static handlePaymentSuccess(params: URLSearchParams) {
    const reference = params.get('reference');
    const status = params.get('status') || 'success';
    const type = params.get('type') || '';
    
    urlLogger.info(`Payment success: reference=${reference}, status=${status}, type=${type}`);
    
    // Extract other parameters
    const queryParams = new URLSearchParams();
    queryParams.append('reference', reference || '');
    queryParams.append('status', status);
    
    if (type) {
      queryParams.append('type', type);
    }
    
    // Add any other parameters
    params.forEach((value, key) => {
      if (key !== 'reference' && key !== 'status' && key !== 'type' && 
          key !== 'action' && key !== 'route') {
        queryParams.append(key, value);
      }
    });
    
    // Construct the path
    const path = `/payments/success?${queryParams.toString()}`;
    urlLogger.info(`Navigating to: ${path}`);
    
    // Navigate to success page with parameters if not already there
    if (window.location.pathname !== '/payments/success') {
      window.history.pushState({}, '', path);
      // Trigger a custom event to update the app
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private static handlePaymentError(params: URLSearchParams) {
    const reference = params.get('reference');
    const message = params.get('message') || 'Unknown error';
    
    urlLogger.info(`Payment error: reference=${reference}, message=${message}`);
    
    // Construct the path
    const path = `/payments/error?reference=${reference || ''}&message=${message}`;
    
    // Navigate to error page with parameters if not already there
    if (window.location.pathname !== '/payments/error') {
      window.history.pushState({}, '', path);
      // Trigger a custom event to update the app
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }
} 
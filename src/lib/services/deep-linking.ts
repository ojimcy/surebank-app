import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { logger } from '@/lib/utils/logger';
import { crashReportingService } from './crash-reporting';

// Create a logger for deep linking
const deepLinkLogger = logger.create('DeepLinking');

export interface DeepLinkRoute {
  path: string;
  params?: Record<string, string>;
  action?: string;
}

export interface DeepLinkHandler {
  pattern: RegExp;
  handler: (params: Record<string, string>, url: string) => void;
}

export class DeepLinkingService {
  private static instance: DeepLinkingService;
  private handlers: DeepLinkHandler[] = [];
  private isInitialized = false;

  public static getInstance(): DeepLinkingService {
    if (!DeepLinkingService.instance) {
      DeepLinkingService.instance = new DeepLinkingService();
    }
    return DeepLinkingService.instance;
  }

  public initialize(): void {
    if (this.isInitialized) {
      deepLinkLogger.info('Deep linking already initialized');
      return;
    }

    deepLinkLogger.info('Initializing deep linking service...');

    // Register default handlers
    this.registerDefaultHandlers();

    if (Capacitor.isNativePlatform()) {
      deepLinkLogger.info('Setting up native deep link listeners');
      App.addListener('appUrlOpen', (event) => {
        deepLinkLogger.info(`App opened with URL: ${event.url}`);
        this.handleUrl(event.url);
      });

      // Handle app state changes
      App.addListener('appStateChange', (state) => {
        if (state.isActive) {
          deepLinkLogger.debug('App became active');
          this.checkPendingUrl();
        }
      });
    } else {
      // Handle web browser URL changes
      this.setupWebHandlers();
    }

    this.isInitialized = true;
    deepLinkLogger.info('Deep linking initialized successfully');
  }

  private setupWebHandlers(): void {
    // Handle initial page load
    this.handleWebUrl(window.location.href);

    // Handle browser navigation
    window.addEventListener('popstate', () => {
      this.handleWebUrl(window.location.href);
    });

    // Handle hash changes
    window.addEventListener('hashchange', () => {
      this.handleWebUrl(window.location.href);
    });
  }

  private handleWebUrl(url: string): void {
    // Only handle specific web URLs that match our deep link patterns
    const urlObj = new URL(url);
    
    // Check if it's a deep link pattern in web format
    if (urlObj.searchParams.has('action') || urlObj.pathname.includes('/app/')) {
      this.handleUrl(url);
    }
  }

  private registerDefaultHandlers(): void {
    // Payment success/error handlers
    this.registerHandler(/^surebank:\/\/.*\/payments\/(success|error)/, (params, url) => {
      this.handlePaymentResult(params, url);
    });

    // Package management
    this.registerHandler(/^surebank:\/\/.*\/packages\/(.+)/, (params, url) => {
      const packageId = params['$1'];
      this.navigateToRoute(`/packages/${packageId}`, params);
    });

    // Order management
    this.registerHandler(/^surebank:\/\/.*\/orders\/(.+)/, (params, url) => {
      const orderId = params['$1'];
      this.navigateToRoute(`/orders/${orderId}`, params);
    });

    // Transaction details
    this.registerHandler(/^surebank:\/\/.*\/transactions\/(.+)/, (params, url) => {
      const transactionId = params['$1'];
      this.navigateToRoute(`/payments/transaction-details?id=${transactionId}`, params);
    });

    // Settings deep links
    this.registerHandler(/^surebank:\/\/.*\/settings(?:\/(.+))?/, (params, url) => {
      const section = params['$1'];
      const route = section ? `/settings/${section}` : '/settings';
      this.navigateToRoute(route, params);
    });

    // Dashboard sections
    this.registerHandler(/^surebank:\/\/.*\/dashboard(?:\/(.+))?/, (params, url) => {
      const section = params['$1'];
      const route = section ? `/dashboard/${section}` : '/dashboard';
      this.navigateToRoute(route, params);
    });

    // Product catalog
    this.registerHandler(/^surebank:\/\/.*\/products\/(.+)/, (params, url) => {
      const productId = params['$1'];
      this.navigateToRoute(`/products/${productId}`, params);
    });

    // Cards management
    this.registerHandler(/^surebank:\/\/.*\/cards(?:\/(.+))?/, (params, url) => {
      const cardId = params['$1'];
      const route = cardId ? `/cards/${cardId}` : '/cards';
      this.navigateToRoute(route, params);
    });

    // KYC verification
    this.registerHandler(/^surebank:\/\/.*\/kyc(?:\/(.+))?/, (params, url) => {
      const step = params['$1'];
      const route = step ? `/settings/kyc-${step}` : '/settings/kyc-verification';
      this.navigateToRoute(route, params);
    });

    // Schedule management
    this.registerHandler(/^surebank:\/\/.*\/schedules\/(.+)/, (params, url) => {
      const scheduleId = params['$1'];
      this.navigateToRoute(`/schedules/${scheduleId}`, params);
    });

    // Universal navigation handler
    this.registerHandler(/^surebank:\/\/.*\/navigate/, (params, url) => {
      this.handleNavigateAction(params, url);
    });

    // Web app links
    this.registerHandler(/^https:\/\/surebankstores\.ng\/app\/(.+)/, (params, url) => {
      const path = params['$1'];
      this.navigateToRoute(`/${path}`, params);
    });
  }

  public registerHandler(pattern: RegExp, handler: (params: Record<string, string>, url: string) => void): void {
    this.handlers.push({ pattern, handler });
    deepLinkLogger.debug(`Registered handler for pattern: ${pattern.source}`);
  }

  private handleUrl(url: string): void {
    try {
      deepLinkLogger.info('Processing deep link:', url);

      // Record deep link usage for analytics
      crashReportingService.recordUserAction('deep_link_opened', {
        url: url.replace(/([?&])(token|key|secret)=[^&]*/gi, '$1$2=***'),
        timestamp: new Date().toISOString(),
      });

      const urlObj = new URL(url);
      const params = this.extractUrlParams(urlObj);

      // Try to match against registered handlers
      for (const { pattern, handler } of this.handlers) {
        const match = url.match(pattern);
        if (match) {
          const matchParams = { ...params };
          
          // Add regex capture groups to params
          for (let i = 1; i < match.length; i++) {
            matchParams[`$${i}`] = match[i];
          }

          deepLinkLogger.info(`Matched handler for pattern: ${pattern.source}`);
          handler(matchParams, url);
          return;
        }
      }

      // Fallback to generic navigation handler
      deepLinkLogger.warn('No specific handler found, using fallback navigation');
      this.handleFallbackNavigation(url, params);

    } catch (error) {
      deepLinkLogger.error('Error processing deep link:', error);
      crashReportingService.recordError(error as Error, {
        deep_link_url: url,
        error_type: 'DEEP_LINK_PROCESSING_ERROR',
      });

      // Navigate to dashboard as fallback
      this.navigateToRoute('/dashboard');
    }
  }

  private extractUrlParams(urlObj: URL): Record<string, string> {
    const params: Record<string, string> = {};

    // Extract search params
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Extract hash params if present
    if (urlObj.hash) {
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));
      hashParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    return params;
  }

  private handlePaymentResult(params: Record<string, string>, url: string): void {
    const isSuccess = url.includes('/success');
    const reference = params.reference;
    const status = params.status || (isSuccess ? 'success' : 'error');
    const type = params.type || '';

    deepLinkLogger.info(`Payment result: ${status}, reference: ${reference}`);

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (reference) queryParams.append('reference', reference);
    queryParams.append('status', status);
    if (type) queryParams.append('type', type);

    // Add any additional parameters
    Object.entries(params).forEach(([key, value]) => {
      if (!['reference', 'status', 'type', 'action', 'route'].includes(key)) {
        queryParams.append(key, value);
      }
    });

    const route = isSuccess 
      ? `/payments/success?${queryParams.toString()}`
      : `/payments/error?${queryParams.toString()}`;

    this.navigateToRoute(route, params);
  }

  private handleNavigateAction(params: Record<string, string>, url: string): void {
    const action = params.action;
    const route = params.route;

    deepLinkLogger.info(`Navigate action: ${action}, route: ${route}`);

    if (action === 'navigate' && route) {
      // Remove action and route from params before adding as query params
      const { action: _, route: __, ...otherParams } = params;
      this.navigateToRoute(route, otherParams);
    } else {
      deepLinkLogger.warn('Invalid navigate action parameters');
      this.navigateToRoute('/dashboard');
    }
  }

  private handleFallbackNavigation(url: string, params: Record<string, string>): void {
    // Try to extract a meaningful route from the URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);

    if (pathSegments.length > 0) {
      // Try to construct a route from the path
      const route = `/${pathSegments.join('/')}`;
      this.navigateToRoute(route, params);
    } else {
      // Default to dashboard
      this.navigateToRoute('/dashboard');
    }
  }

  private navigateToRoute(route: string, params: Record<string, string> = {}): void {
    deepLinkLogger.info(`Navigating to route: ${route}`);

    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (!['action', 'route'].includes(key)) {
        queryParams.append(key, value);
      }
    });

    // Construct final path
    let finalPath = route;
    const queryString = queryParams.toString();
    if (queryString && !route.includes('?')) {
      finalPath += `?${queryString}`;
    } else if (queryString) {
      finalPath += `&${queryString}`;
    }

    deepLinkLogger.info(`Final navigation path: ${finalPath}`);

    // Navigate if not already at the target route
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== finalPath) {
      window.history.pushState({}, '', finalPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private checkPendingUrl(): void {
    // This can be used to handle any pending URLs when the app becomes active
    deepLinkLogger.debug('Checking for pending URLs');
  }

  // Public API methods
  public createDeepLink(route: string, params: Record<string, string> = {}): string {
    const baseUrl = 'surebank://navigate';
    const url = new URL(baseUrl);
    
    url.searchParams.append('action', 'navigate');
    url.searchParams.append('route', route);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return url.toString();
  }

  public createWebLink(route: string, params: Record<string, string> = {}): string {
    const baseUrl = 'https://surebankstores.ng/app';
    const url = new URL(baseUrl + route);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return url.toString();
  }
}

// Export singleton instance
export const deepLinkingService = DeepLinkingService.getInstance();
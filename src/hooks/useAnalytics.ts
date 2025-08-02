import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '@/lib/services/analytics';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/utils/logger';

const analyticsLogger = logger.create('useAnalytics');

export function useAnalytics() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Track page views
  useEffect(() => {
    const trackPageView = async () => {
      try {
        const screenName = getScreenNameFromPath(location.pathname);
        await analyticsService.setCurrentScreen(screenName);
        await analyticsService.logEvent('page_view', {
          page_path: location.pathname,
          page_title: screenName,
        });
      } catch (error) {
        analyticsLogger.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);

  // Set user properties when user changes
  useEffect(() => {
    const setUserAnalytics = async () => {
      if (isAuthenticated && user) {
        try {
          await analyticsService.setUserId(user.id);
          await analyticsService.setUserProperties({
            user_type: user.role || 'customer',
            is_verified: user.isVerified || false,
            registration_date: user.createdAt || '',
            has_packages: (user.packages?.length ?? 0) > 0,
          });
        } catch (error) {
          analyticsLogger.error('Failed to set user analytics:', error);
        }
      }
    };

    setUserAnalytics();
  }, [isAuthenticated, user]);

  const trackEvent = useCallback(async (eventName: string, parameters: Record<string, unknown> = {}) => {
    try {
      await analyticsService.logEvent(eventName, parameters);
    } catch (error) {
      analyticsLogger.error('Failed to track event:', error);
    }
  }, []);

  const trackUserAction = useCallback(async (action: string, target: string, value?: number) => {
    try {
      await analyticsService.logUserEngagement(action, target, value);
    } catch (error) {
      analyticsLogger.error('Failed to track user action:', error);
    }
  }, []);

  const trackFeatureUsage = useCallback(async (featureName: string, context?: string) => {
    try {
      await analyticsService.logFeatureUsed(featureName, context);
    } catch (error) {
      analyticsLogger.error('Failed to track feature usage:', error);
    }
  }, []);

  const trackError = useCallback(async (errorType: string, errorMessage: string) => {
    try {
      const screenName = getScreenNameFromPath(location.pathname);
      await analyticsService.logError(errorType, errorMessage, screenName);
    } catch (error) {
      analyticsLogger.error('Failed to track error:', error);
    }
  }, [location.pathname]);

  const trackPayment = useCallback(async (
    action: 'initiated' | 'completed',
    method: string,
    amount: number,
    purpose: string,
    transactionId?: string
  ) => {
    try {
      if (action === 'initiated') {
        await analyticsService.logPaymentInitiated(method, amount, purpose);
      } else {
        await analyticsService.logPaymentCompleted(method, amount, transactionId || '');
      }
    } catch (error) {
      analyticsLogger.error('Failed to track payment:', error);
    }
  }, []);

  const trackPackageAction = useCallback(async (
    action: string,
    packageType: string,
    amount?: number,
    packageId?: string
  ) => {
    try {
      await analyticsService.logEvent(`package_${action}`, {
        package_type: packageType,
        package_id: packageId,
        amount: amount || 0,
        currency: 'NGN',
      });
    } catch (error) {
      analyticsLogger.error('Failed to track package action:', error);
    }
  }, []);

  const trackKycProgress = useCallback(async (step: string, status: 'started' | 'completed' | 'failed') => {
    try {
      await analyticsService.logEvent('kyc_progress', {
        step_name: step,
        step_status: status,
      });
    } catch (error) {
      analyticsLogger.error('Failed to track KYC progress:', error);
    }
  }, []);

  const trackSearch = useCallback(async (searchTerm: string, category?: string, resultCount?: number) => {
    try {
      await analyticsService.logEvent('search', {
        search_term: searchTerm,
        search_category: category,
        result_count: resultCount,
      });
    } catch (error) {
      analyticsLogger.error('Failed to track search:', error);
    }
  }, []);

  const trackSocialAction = useCallback(async (action: string, platform: string, contentType?: string) => {
    try {
      await analyticsService.logEvent('social_action', {
        action,
        platform,
        content_type: contentType,
      });
    } catch (error) {
      analyticsLogger.error('Failed to track social action:', error);
    }
  }, []);

  return {
    trackEvent,
    trackUserAction,
    trackFeatureUsage,
    trackError,
    trackPayment,
    trackPackageAction,
    trackKycProgress,
    trackSearch,
    trackSocialAction,
  };
}

// Utility function to convert path to screen name
function getScreenNameFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) return 'Dashboard';
  
  // Handle specific routes
  const routeMap: Record<string, string> = {
    '': 'Dashboard',
    'dashboard': 'Dashboard',
    'packages': 'Packages',
    'products': 'Product Catalog',
    'settings': 'Settings',
    'payments': 'Payments',
    'orders': 'Orders',
    'cards': 'Cards',
    'schedules': 'Schedules',
    'auth': 'Authentication',
  };

  const mainSection = segments[0];
  const subSection = segments[1];

  if (routeMap[mainSection]) {
    if (subSection) {
      return `${routeMap[mainSection]} - ${formatSubSection(subSection)}`;
    }
    return routeMap[mainSection];
  }

  // Fallback: capitalize and format the path
  return segments
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' - ');
}

function formatSubSection(section: string): string {
  return section
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Hook for tracking performance metrics
export function usePerformanceTracking() {
  const trackTiming = useCallback(async (name: string, duration: number, category?: string) => {
    try {
      await analyticsService.logEvent('timing_complete', {
        timing_category: category || 'performance',
        timing_var: name,
        timing_value: Math.round(duration),
      });
    } catch (error) {
      analyticsLogger.error('Failed to track timing:', error);
    }
  }, []);

  const trackLoadTime = useCallback(async (component: string, loadTime: number) => {
    try {
      await analyticsService.logEvent('component_load_time', {
        component_name: component,
        load_time: Math.round(loadTime),
      });
    } catch (error) {
      analyticsLogger.error('Failed to track load time:', error);
    }
  }, []);

  const trackApiCall = useCallback(async (
    endpoint: string,
    method: string,
    duration: number,
    status: number
  ) => {
    try {
      await analyticsService.logEvent('api_call', {
        api_endpoint: endpoint,
        http_method: method,
        response_time: Math.round(duration),
        status_code: status,
      });
    } catch (error) {
      analyticsLogger.error('Failed to track API call:', error);
    }
  }, []);

  return {
    trackTiming,
    trackLoadTime,
    trackApiCall,
  };
}
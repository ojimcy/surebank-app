import { Preferences } from '@capacitor/preferences';

// Keys for storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
};

// In-memory fallback storage for platforms where Preferences might fail
const memoryStorage = new Map<string, string>();

/**
 * Cross-platform storage utility that works on web and mobile
 */
const storage = {
  /**
   * Set an item in storage
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Try to store in Capacitor Preferences
      await Preferences.set({ key, value });
      
      // For web, also store in localStorage for backward compatibility
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Using fallback storage mechanism:', error);
      
      // Use in-memory fallback storage
      memoryStorage.set(key, value);
      
      // For web, try localStorage as fallback
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.error('Failed to use localStorage fallback:', e);
        }
      }
    }
  },

  /**
   * Get an item from storage
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Try to get from Capacitor Preferences
      const { value } = await Preferences.get({ key });
      
      // Return the value if found
      if (value !== null) {
        return value;
      }
      
      // For web, fallback to localStorage
      if (typeof localStorage !== 'undefined') {
        const localValue = localStorage.getItem(key);
        if (localValue !== null) {
          return localValue;
        }
      }
      
      // Check fallback memory storage
      const memoryValue = memoryStorage.get(key);
      return memoryValue || null;
    } catch (error) {
      console.warn('Using fallback storage mechanism:', error);
      
      // For web, try localStorage
      if (typeof localStorage !== 'undefined') {
        try {
          const localValue = localStorage.getItem(key);
          if (localValue !== null) {
            return localValue;
          }
        } catch (e) {
          console.error('Failed to use localStorage fallback:', e);
        }
      }
      
      // Check fallback memory storage
      const memoryValue = memoryStorage.get(key);
      return memoryValue || null;
    }
  },

  /**
   * Remove an item from storage
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      // Remove from Capacitor Preferences
      await Preferences.remove({ key });
      
      // For web, also remove from localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      
      // Also remove from memory fallback
      memoryStorage.delete(key);
    } catch (error) {
      console.warn('Using fallback storage mechanism:', error);
      
      // Clear from memory fallback
      memoryStorage.delete(key);
      
      // For web, try localStorage as fallback
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error('Failed to use localStorage fallback:', e);
        }
      }
    }
  },

  /**
   * Clear all items from storage
   */
  clear: async (): Promise<void> => {
    try {
      // Clear all Capacitor Preferences
      await Preferences.clear();
      
      // For web, also clear localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      
      // Clear memory fallback
      memoryStorage.clear();
    } catch (error) {
      console.warn('Using fallback storage mechanism:', error);
      
      // Clear memory fallback
      memoryStorage.clear();
      
      // For web, try localStorage as fallback
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.clear();
        } catch (e) {
          console.error('Failed to use localStorage fallback:', e);
        }
      }
    }
  }
};

export default storage; 
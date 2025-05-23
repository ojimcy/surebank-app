import { Preferences } from '@capacitor/preferences';

// Keys for storage
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
};

/**
 * Cross-platform storage utility that works on web and mobile
 */
const storage = {
  /**
   * Set an item in storage
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Store in Capacitor Preferences
      await Preferences.set({ key, value });
      
      // For web, also store in localStorage for backward compatibility
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting storage item:', error);
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
      
      // For web, fallback to localStorage for backward compatibility
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting storage item:', error);
      return null;
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
    } catch (error) {
      console.error('Error removing storage item:', error);
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
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

export default storage; 
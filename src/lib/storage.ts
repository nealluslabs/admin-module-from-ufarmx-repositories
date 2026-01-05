const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  REMEMBER_EMAIL: 'rememberEmail',
} as const;

export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      // Try to parse as JSON, if it fails, return as string
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch {
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },
};

export { STORAGE_KEYS };


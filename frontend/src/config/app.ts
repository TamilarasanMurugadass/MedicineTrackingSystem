// Application configuration
export const APP_CONFIG = {
  // Environment settings
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Feature flags
  enableStrictMode: process.env.NODE_ENV === 'development', // Only enable in development
  enableDebugMode: process.env.NODE_ENV === 'development',

  // API configuration
  api: {
    // Request timeout in milliseconds
    timeout: 30000,
    // Maximum retry attempts for failed requests
    maxRetries: 3,
    // Delay between retries in milliseconds
    retryDelay: 1000,
  },

  // Performance settings
  performance: {
    // Debounce delay for search inputs (in milliseconds)
    searchDebounceDelay: 300,
    // Enable request cancellation
    enableRequestCancellation: true,
  },
} as const;
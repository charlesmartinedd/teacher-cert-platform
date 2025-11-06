/**
 * Environment variable configuration with type safety
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvVarOptional(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

export const env = {
  // Public variables
  siteUrl: getEnvVar('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
  siteName: getEnvVar('NEXT_PUBLIC_SITE_NAME', 'TeachCertPro'),
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api'),

  // Feature flags
  enableAuth: getEnvVar('NEXT_PUBLIC_ENABLE_AUTH', 'false') === 'true',
  enablePayments: getEnvVar('NEXT_PUBLIC_ENABLE_PAYMENTS', 'false') === 'true',
  enableAnalytics: getEnvVar('NEXT_PUBLIC_ENABLE_ANALYTICS', 'false') === 'true',

  // Server-only variables
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  isDevelopment: getEnvVar('NODE_ENV', 'development') === 'development',
  isProduction: getEnvVar('NODE_ENV', 'development') === 'production',
  isTest: getEnvVar('NODE_ENV', 'development') === 'test',

  // Rate limiting
  rateLimitWindowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '60000'), 10),
  rateLimitMaxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),

  // Optional variables
  gaId: getEnvVarOptional('NEXT_PUBLIC_GA_ID'),
  stripePublicKey: getEnvVarOptional('STRIPE_PUBLIC_KEY'),
  databaseUrl: getEnvVarOptional('DATABASE_URL'),
} as const;

// Validate environment on startup
export function validateEnv(): void {
  const required = ['NEXT_PUBLIC_SITE_URL'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`Warning: Missing optional environment variables: ${missing.join(', ')}`);
  }
}

// Retry logic utilities
export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  retryCondition?: (error: any) => boolean;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  delay: 1000,
  backoff: 'exponential',
  retryCondition: (error: any) => {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT' ||
      (error.response && error.response.status >= 500) ||
      error.message?.includes('timeout') ||
      error.message?.includes('network')
    );
  }
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const config = { ...defaultRetryOptions, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's the last attempt or if retry condition is not met
      if (attempt === config.maxRetries || !config.retryCondition(error)) {
        throw error;
      }

      // Calculate delay with backoff
      const delay = config.backoff === 'exponential' 
        ? config.delay * Math.pow(2, attempt)
        : config.delay * (attempt + 1);

      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, (error as Error).message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Enhanced error handler with retry context
export const handleErrorWithRetry = (error: any, t: (key: string) => string, retryCount: number = 0): string => {
  console.error(`Error (attempt ${retryCount + 1}):`, error);

  // Network-related errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
    return t('network_error');
  }

  // Timeout errors
  if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
    return t('timeout_error');
  }

  // Server errors
  if (error.response?.status >= 500) {
    return t('server_error');
  }

  // Authentication errors
  if (error.response?.status === 401) {
    return t('authentication_error');
  }

  // Authorization errors
  if (error.response?.status === 403) {
    return t('authorization_error');
  }

  // Validation errors
  if (error.response?.status === 400) {
    return error.message || t('validation_error');
  }

  // Rate limiting
  if (error.response?.status === 429) {
    return t('rate_limit_error');
  }

  // Specific Appwrite errors
  if (error.type) {
    switch (error.type) {
      case 'user_already_exists':
        return t('user_already_exists');
      case 'invalid_credentials':
        return t('invalid_credentials');
      case 'user_not_found':
        return t('user_not_found');
      case 'document_not_found':
        return t('document_not_found');
      default:
        return error.message || t('unknown_error');
    }
  }

  return error.message || t('unknown_error');
};

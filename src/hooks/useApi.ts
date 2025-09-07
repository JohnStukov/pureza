import { useState, useCallback, useRef, useEffect } from 'react';
import { withRetry } from '../utils/retryLogic';
import { handleError } from '../utils/errorHandler';

export interface UseApiOptions {
  retryOptions?: {
    maxRetries?: number;
    delay?: number;
  };
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { retryOptions = {}, onSuccess, onError } = options;

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await withRetry(
        () => apiFunction(...args),
        {
          maxRetries: retryOptions.maxRetries || 2,
          delay: retryOptions.delay || 1000,
          retryCondition: (error: any) => {
            // Don't retry if request was aborted
            return !abortControllerRef.current?.signal.aborted;
          }
        }
      );

      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      // Don't set error if request was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        const errorMessage = handleError(err, (key: string) => key);
        setError(errorMessage);
        onError?.(err);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, retryOptions, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

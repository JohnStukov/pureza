import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  onFinally?: () => void;
}

export interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: any;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export const useAsync = <T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const isMountedRef = useRef(true);

  const { immediate = false, onSuccess, onError, onFinally } = options;

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    if (!isMountedRef.current) return null;

    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction(...args);
      
      if (isMountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
      
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        onError?.(err);
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        onFinally?.();
      }
    }
  }, [asyncFunction, onSuccess, onError, onFinally]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
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

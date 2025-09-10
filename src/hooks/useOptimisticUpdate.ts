import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any, originalData: T) => void;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

export const useOptimisticUpdate = <TData, TPayload>(
  updateFn: (data: TPayload) => Promise<any>,
  options: OptimisticUpdateOptions<TData> = {}
) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const optimisticUpdate = useCallback(async (
    payload: TPayload,
    optimisticData: TData,
    setData: (data: TData) => void
  ) => {
    const originalData = optimisticData;
    
    // Optimistic update
    setData(optimisticData);
    setIsUpdating(true);

    if (options.showToast !== false && options.successMessage) {
      toast.success(options.successMessage);
    }

    try {
      const result = await updateFn(payload);
      // For delete operations, we don't update with the result
      // The setData function handles the UI update
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      // Revert on error
      setData(originalData);
      options.onError?.(error, originalData);
      
      if (options.showToast !== false) {
        toast.error(options.errorMessage || 'Update failed');
      }
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [updateFn, options]);

  return {
    optimisticUpdate,
    isUpdating
  };
};

export default useOptimisticUpdate;

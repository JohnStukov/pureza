import { useState, useCallback } from 'react';

export interface ModalState<T = any> {
  isOpen: boolean;
  type: string | null;
  data: T | undefined;
}

export interface UseModalOptions<T = any> {
  onOpen?: (type: string, data?: T) => void;
  onClose?: () => void;
  onConfirm?: (type: string, data?: T) => void;
}

export const useModal = <T = any>(options: UseModalOptions<T> = {}) => {
  const [modalState, setModalState] = useState<ModalState<T>>({
    isOpen: false,
    type: null,
    data: undefined
  });

  const openModal = useCallback((type: string, data?: T) => {
    setModalState({
      isOpen: true,
      type,
      data: data
    });
    options.onOpen?.(type, data);
  }, [options]);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      type: null,
      data: undefined
    });
    options.onClose?.();
  }, [options]);

  const confirmModal = useCallback(() => {
    if (modalState.type) {
      options.onConfirm?.(modalState.type, modalState.data);
    }
  }, [modalState, options]);

  const updateModalData = useCallback((data: T) => {
    setModalState(prev => ({
      ...prev,
      data
    }));
  }, []);

  return {
    modalState,
    isOpen: modalState.isOpen,
    type: modalState.type,
    data: modalState.data,
    openModal,
    closeModal,
    confirmModal,
    updateModalData
  };
};

import React from 'react';
import { Modal as BootstrapModal, Button } from 'react-bootstrap';

export interface ModalProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'lg' | 'xl';
  centered?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  className?: string;
  scrollable?: boolean;
  fullscreen?: true | string;
}

export interface ModalAction {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface ModalWithActionsProps extends ModalProps {
  actions?: ModalAction[];
  onConfirm?: () => void;
  confirmText?: string;
  confirmVariant?: string;
  cancelText?: string;
  cancelVariant?: string;
}

const Modal: React.FC<ModalWithActionsProps> = ({
  show,
  onHide,
  title,
  children,
  size,
  centered = true,
  backdrop = true,
  keyboard = true,
  className,
  scrollable = false,
  fullscreen,
  actions,
  onConfirm,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  cancelText = 'Cancel',
  cancelVariant = 'secondary'
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onHide();
  };

  const renderActions = () => {
    if (actions && actions.length > 0) {
      return (
        <BootstrapModal.Footer>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'secondary'}
              onClick={action.onClick || onHide}
              disabled={action.disabled}
              className={action.className}
            >
              {action.text}
            </Button>
          ))}
        </BootstrapModal.Footer>
      );
    }

    if (onConfirm) {
      return (
        <BootstrapModal.Footer>
          <Button variant={cancelVariant} onClick={onHide}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </BootstrapModal.Footer>
      );
    }

    return null;
  };

  return (
    <BootstrapModal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      backdrop={backdrop}
      keyboard={keyboard}
      className={className}
      scrollable={scrollable}
      fullscreen={fullscreen}
    >
      {title && (
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>{title}</BootstrapModal.Title>
        </BootstrapModal.Header>
      )}
      
      <BootstrapModal.Body className={scrollable ? 'overflow-auto' : ''}>
        {children}
      </BootstrapModal.Body>
      
      {renderActions()}
    </BootstrapModal>
  );
};

export default Modal;

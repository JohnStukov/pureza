import React from 'react';
import { Modal as BootstrapModal, Button } from 'react-bootstrap';
import './TeamMembersModal.css';

export interface TeamMembersModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  className?: string;
}

const TeamMembersModal: React.FC<TeamMembersModalProps> = ({
  show,
  onHide,
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  className
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onHide();
  };

  return (
    <BootstrapModal
      show={show}
      onHide={onHide}
      size="xl"
      centered={false}
      backdrop={true}
      keyboard={true}
      className={`team-members-modal ${className || ''}`}
      scrollable={true}
      style={{ 
        '--bs-modal-width': '90vw',
        '--bs-modal-max-width': '1200px'
      } as React.CSSProperties}
    >
      <BootstrapModal.Header closeButton className="border-bottom">
        <BootstrapModal.Title className="d-flex align-items-center gap-2">
          <i className="fas fa-users text-primary"></i>
          {title}
        </BootstrapModal.Title>
      </BootstrapModal.Header>
      
      <BootstrapModal.Body 
        className="p-0"
        style={{ 
          maxHeight: '70vh',
          overflow: 'auto'
        }}
      >
        <div className="p-3">
          {children}
        </div>
      </BootstrapModal.Body>
      
      {onConfirm && (
        <BootstrapModal.Footer className="border-top bg-light">
          <div className="d-flex justify-content-between w-100">
            <Button variant="outline-secondary" onClick={onHide}>
              <i className="fas fa-times me-2"></i>
              {cancelText}
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              <i className="fas fa-check me-2"></i>
              {confirmText}
            </Button>
          </div>
        </BootstrapModal.Footer>
      )}
    </BootstrapModal>
  );
};

export default TeamMembersModal;

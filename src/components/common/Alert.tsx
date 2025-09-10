import React from 'react';
import { Alert as BootstrapAlert } from 'react-bootstrap';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  dismissible?: boolean;
  show?: boolean;
  onClose?: () => void;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  centered?: boolean;
  size?: 'sm' | 'lg';
}

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  dismissible = false,
  show = true,
  onClose,
  className = '',
  icon,
  title,
  centered = false,
  size,
  ...props
}) => {
  if (!show) return null;

  const alertClasses = [
    className,
    centered ? 'text-center' : '',
    size ? `alert-${size}` : ''
  ].filter(Boolean).join(' ');

  return (
    <BootstrapAlert
      variant={variant}
      dismissible={dismissible}
      onClose={onClose}
      className={alertClasses}
      {...props}
    >
      {icon && <span className="me-2">{icon}</span>}
      {title && <BootstrapAlert.Heading>{title}</BootstrapAlert.Heading>}
      {children}
    </BootstrapAlert>
  );
};

export default Alert;

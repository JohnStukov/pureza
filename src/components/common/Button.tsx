import React from 'react';
import { Button as BootstrapButton, Spinner } from 'react-bootstrap';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning' | 'outline-info' | 'outline-light' | 'outline-dark';
  size?: 'sm' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size,
  type = 'button',
  disabled = false,
  loading = false,
  loadingText,
  className = '',
  onClick,
  href,
  target,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const isDisabled = disabled || loading;
  const buttonText = loading ? (loadingText || 'Loading...') : children;

  const buttonContent = (
    <>
      {loading && <Spinner animation="border" size="sm" className="me-2" />}
      {!loading && icon && iconPosition === 'left' && <span className="me-2">{icon}</span>}
      {buttonText}
      {!loading && icon && iconPosition === 'right' && <span className="ms-2">{icon}</span>}
    </>
  );

  const buttonClasses = `${className} ${fullWidth ? 'w-100' : ''}`.trim();

  if (href) {
    return (
      <BootstrapButton
        as="a"
        href={href}
        target={target}
        variant={variant}
        size={size}
        disabled={isDisabled}
        className={buttonClasses}
        {...props}
      >
        {buttonContent}
      </BootstrapButton>
    );
  }

  return (
    <BootstrapButton
      variant={variant}
      size={size}
      type={type}
      disabled={isDisabled}
      className={buttonClasses}
      onClick={onClick}
      {...props}
    >
      {buttonContent}
    </BootstrapButton>
  );
};

export default Button;

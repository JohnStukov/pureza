import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  border?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  bg?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  text?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'muted' | 'white';
  size?: 'sm' | 'lg';
  centered?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  header,
  footer,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  variant,
  border,
  bg,
  text,
  size,
  centered = false,
  hover = false,
  onClick,
  ...props
}) => {
  const cardClasses = [
    className,
    centered ? 'text-center' : '',
    hover ? 'card-hover' : '',
    onClick ? 'cursor-pointer' : ''
  ].filter(Boolean).join(' ');

  const cardProps = {
    className: cardClasses,
    variant,
    border,
    bg,
    text,
    size,
    onClick,
    ...props
  };

  return (
    <BootstrapCard {...cardProps}>
      {(title || subtitle || header) && (
        <BootstrapCard.Header className={headerClassName}>
          {header || (
            <>
              {title && <BootstrapCard.Title>{title}</BootstrapCard.Title>}
              {subtitle && <BootstrapCard.Subtitle className="mb-2 text-muted">{subtitle}</BootstrapCard.Subtitle>}
            </>
          )}
        </BootstrapCard.Header>
      )}
      
      <BootstrapCard.Body className={bodyClassName}>
        {children}
      </BootstrapCard.Body>
      
      {footer && (
        <BootstrapCard.Footer className={footerClassName}>
          {footer}
        </BootstrapCard.Footer>
      )}
    </BootstrapCard>
  );
};

export default Card;

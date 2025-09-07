import React from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  size?: 'sm';
  text?: string;
  centered?: boolean;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'sm', 
  text, 
  centered = false,
  className = ''
}) => {
  const spinner = (
    <div className={`d-flex align-items-center ${className}`}>
      <Spinner animation="border" size={size} role="status" />
      {text && <span className="ms-2">{text}</span>}
    </div>
  );

  if (centered) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;

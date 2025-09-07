import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('renders spinner with custom text', () => {
    render(<LoadingSpinner text="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders centered spinner when centered prop is true', () => {
    render(<LoadingSpinner centered />);
    
    const container = screen.getByRole('status').closest('div');
    expect(container).toHaveClass('d-flex', 'justify-content-center', 'align-items-center');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('spinner-border-sm');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    
    const container = screen.getByRole('status').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});

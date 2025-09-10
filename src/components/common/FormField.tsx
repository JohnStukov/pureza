import React from 'react';
import { Form } from 'react-bootstrap';

export interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  errors: string[];
  touched?: boolean;
  helpText?: string;
  rows?: number;
  step?: string;
  min?: number;
  max?: number;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  value,
  onChange,
  onBlur,
  errors,
  touched = false,
  helpText,
  rows = 3,
  step,
  min,
  max,
  className = ''
}) => {
  const hasError = touched && errors.length > 0;
  const fieldId = `field-${name}`;

  const commonProps = {
    id: fieldId,
    value,
    onChange,
    onBlur,
    placeholder,
    required,
    disabled,
    isInvalid: hasError,
    className: className
  };

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <Form.Control
          as="textarea"
          rows={rows}
          {...commonProps}
        />
      );
    }

    if (type === 'number') {
      return (
        <Form.Control
          type="number"
          step={step}
          min={min}
          max={max}
          {...commonProps}
        />
      );
    }

    return (
      <Form.Control
        type={type}
        {...commonProps}
      />
    );
  };

  return (
    <Form.Group className={`mb-3 ${className}`} controlId={fieldId}>
      <Form.Label>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>
      
      {renderInput()}
      
      {helpText && !hasError && (
        <Form.Text className="text-muted">
          {helpText}
        </Form.Text>
      )}
      
      {hasError && (
        <Form.Text className="text-danger">
          {errors[0]}
        </Form.Text>
      )}
    </Form.Group>
  );
};

export default FormField;

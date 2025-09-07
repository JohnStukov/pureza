// Validation utilities
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export const validateField = (value: any, rules: ValidationRule): ValidationResult => {
  const errors: string[] = [];

  // Required validation
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push('This field is required');
    return { isValid: false, errors };
  }

  // Skip other validations if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return { isValid: true, errors: [] };
  }

  const stringValue = value.toString();

  // Min length validation
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`);
  }

  // Max length validation
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push('Invalid format');
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return { isValid: errors.length === 0, errors };
};

// Common validation rules
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    custom: (value: string) => {
      if (value.length < 8) return 'Password must be at least 8 characters';
      if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
      if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
      if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
      if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
      return null;
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  },
  productName: {
    required: true,
    minLength: 2,
    maxLength: 255
  },
  productDescription: {
    maxLength: 1000
  },
  price: {
    required: true,
    custom: (value: number) => {
      if (isNaN(value) || value < 0) return 'Price must be a positive number';
      if (value > 999999.99) return 'Price cannot exceed 999,999.99';
      return null;
    }
  },
  stock: {
    required: true,
    custom: (value: number) => {
      if (isNaN(value) || !Number.isInteger(value)) return 'Stock must be a whole number';
      if (value < 0) return 'Stock cannot be negative';
      if (value > 999999) return 'Stock cannot exceed 999,999';
      return null;
    }
  }
};

// Sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

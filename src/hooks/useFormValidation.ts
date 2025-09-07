import { useState, useCallback } from 'react';
import { validateField, ValidationRule, sanitizeFormData } from '../utils/validation';

export interface FormField {
  value: any;
  errors: string[];
  touched: boolean;
}

export interface UseFormValidationOptions {
  initialValues: Record<string, any>;
  validationRules: Record<string, ValidationRule>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
}

export const useFormValidation = ({ 
  initialValues, 
  validationRules, 
  onSubmit 
}: UseFormValidationOptions) => {
  const [values, setValues] = useState(initialValues);
  const [fields, setFields] = useState<Record<string, FormField>>(() => {
    const initialFields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach(key => {
      initialFields[key] = {
        value: initialValues[key],
        errors: [],
        touched: false
      };
    });
    return initialFields;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateFieldValue = useCallback((name: string, value: any): string[] => {
    const rule = validationRules[name];
    if (!rule) return [];

    const result = validateField(value, rule);
    return result.errors;
  }, [validationRules]);

  const setFieldValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        errors: validateFieldValue(name, value),
        touched: true
      }
    }));

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  }, [validateFieldValue, submitError]);

  const setFieldTouched = useCallback((name: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
        errors: validateFieldValue(name, prev[name].value)
      }
    }));
  }, [validateFieldValue]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newFields: Record<string, FormField> = {};

    Object.keys(values).forEach(name => {
      const errors = validateFieldValue(name, values[name]);
      newFields[name] = {
        value: values[name],
        errors,
        touched: true
      };
      if (errors.length > 0) {
        isValid = false;
      }
    });

    setFields(newFields);
    return isValid;
  }, [values, validateFieldValue]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const sanitizedValues = sanitizeFormData(values);
      await onSubmit(sanitizedValues);
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setFields(() => {
      const resetFields: Record<string, FormField> = {};
      Object.keys(initialValues).forEach(key => {
        resetFields[key] = {
          value: initialValues[key],
          errors: [],
          touched: false
        };
      });
      return resetFields;
    });
    setSubmitError(null);
  }, [initialValues]);

  const getFieldProps = useCallback((name: string) => ({
    value: fields[name]?.value || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFieldValue(name, e.target.value);
    },
    onBlur: () => setFieldTouched(name),
    isInvalid: fields[name]?.touched && fields[name]?.errors.length > 0,
    errors: fields[name]?.errors || []
  }), [fields, setFieldValue, setFieldTouched]);

  return {
    values,
    fields,
    isSubmitting,
    submitError,
    setFieldValue,
    setFieldTouched,
    validateForm,
    handleSubmit,
    resetForm,
    getFieldProps
  };
};

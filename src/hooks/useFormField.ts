import { useCallback } from 'react';
import { useFormValidation, FormField as FormFieldType } from './useFormValidation';

export interface UseFormFieldOptions {
  initialValues: Record<string, any>;
  validationRules: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
}

export const useFormField = (options: UseFormFieldOptions) => {
  const formValidation = useFormValidation(options);

  const createFieldProps = useCallback((name: string) => {
    const fieldProps = formValidation.getFieldProps(name);
    
    return {
      name,
      value: fieldProps.value,
      onChange: fieldProps.onChange,
      onBlur: fieldProps.onBlur,
      errors: fieldProps.errors,
      touched: formValidation.fields[name]?.touched || false,
      isInvalid: fieldProps.isInvalid
    };
  }, [formValidation]);

  return {
    ...formValidation,
    createFieldProps
  };
};

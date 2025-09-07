import { validateField, validationRules, sanitizeInput, sanitizeFormData } from './validation';

describe('validation', () => {
  describe('validateField', () => {
    it('validates required fields', () => {
      const result = validateField('', { required: true });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('This field is required');
    });

    it('validates email format', () => {
      const validEmail = validateField('test@example.com', validationRules.email);
      expect(validEmail.isValid).toBe(true);

      const invalidEmail = validateField('invalid-email', validationRules.email);
      expect(invalidEmail.isValid).toBe(false);
      expect(invalidEmail.errors).toContain('Invalid format');
    });

    it('validates password strength', () => {
      const weakPassword = validateField('123', validationRules.password);
      expect(weakPassword.isValid).toBe(false);
      expect(weakPassword.errors.length).toBeGreaterThan(0);

      const strongPassword = validateField('StrongPass123!', validationRules.password);
      expect(strongPassword.isValid).toBe(true);
    });

    it('validates name format', () => {
      const validName = validateField('John Doe', validationRules.name);
      expect(validName.isValid).toBe(true);

      const invalidName = validateField('John123', validationRules.name);
      expect(invalidName.isValid).toBe(false);
      expect(invalidName.errors).toContain('Invalid format');
    });

    it('validates price range', () => {
      const validPrice = validateField(10.99, validationRules.price);
      expect(validPrice.isValid).toBe(true);

      const negativePrice = validateField(-5, validationRules.price);
      expect(negativePrice.isValid).toBe(false);
      expect(negativePrice.errors).toContain('Price must be a positive number');

      const tooHighPrice = validateField(1000000, validationRules.price);
      expect(tooHighPrice.isValid).toBe(false);
      expect(tooHighPrice.errors).toContain('Price cannot exceed 999,999.99');
    });

    it('validates stock as integer', () => {
      const validStock = validateField(10, validationRules.stock);
      expect(validStock.isValid).toBe(true);

      const decimalStock = validateField(10.5, validationRules.stock);
      expect(decimalStock.isValid).toBe(false);
      expect(decimalStock.errors).toContain('Stock must be a whole number');

      const negativeStock = validateField(-1, validationRules.stock);
      expect(negativeStock.isValid).toBe(false);
      expect(negativeStock.errors).toContain('Stock cannot be negative');
    });
  });

  describe('sanitizeInput', () => {
    it('trims whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    it('removes HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('removes javascript protocol', () => {
      expect(sanitizeInput('javascript:alert("xss")')).toBe('alert("xss")');
    });

    it('removes event handlers', () => {
      expect(sanitizeInput('onclick="alert(1)"')).toBe('"alert(1)"');
    });
  });

  describe('sanitizeFormData', () => {
    it('sanitizes all string values in form data', () => {
      const formData = {
        name: '  John Doe  ',
        email: 'test@example.com',
        age: 25,
        description: '<script>alert("xss")</script>'
      };

      const sanitized = sanitizeFormData(formData);
      
      expect(sanitized.name).toBe('John Doe');
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.age).toBe(25);
      expect(sanitized.description).toBe('alert("xss")');
    });
  });
});

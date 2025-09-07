import { withRetry, handleErrorWithRetry } from './retryLogic';

// Mock console.warn to avoid noise in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

describe('retryLogic', () => {
  describe('withRetry', () => {
    it('succeeds on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and succeeds', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const result = await withRetry(operation, { maxRetries: 2, delay: 10 });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('fails after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(withRetry(operation, { maxRetries: 2, delay: 10 }))
        .rejects.toThrow('Network error');
      
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('does not retry when retryCondition returns false', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Validation error'));
      
      await expect(withRetry(operation, { 
        maxRetries: 2, 
        delay: 10,
        retryCondition: () => false
      })).rejects.toThrow('Validation error');
      
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('uses exponential backoff by default', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Network error'));
      const startTime = Date.now();
      
      await expect(withRetry(operation, { maxRetries: 2, delay: 100 }))
        .rejects.toThrow('Network error');
      
      const elapsed = Date.now() - startTime;
      // Should be at least 100ms (first retry) + 200ms (second retry) = 300ms
      expect(elapsed).toBeGreaterThanOrEqual(300);
    });
  });

  describe('handleErrorWithRetry', () => {
    const mockT = (key: string) => key;

    it('handles network errors', () => {
      const error = { code: 'NETWORK_ERROR' };
      const result = handleErrorWithRetry(error, mockT);
      expect(result).toBe('network_error');
    });

    it('handles timeout errors', () => {
      const error = { code: 'TIMEOUT' };
      const result = handleErrorWithRetry(error, mockT);
      expect(result).toBe('timeout_error');
    });

    it('handles server errors', () => {
      const error = { response: { status: 500 } };
      const result = handleErrorWithRetry(error, mockT);
      expect(result).toBe('server_error');
    });

    it('handles authentication errors', () => {
      const error = { response: { status: 401 } };
      const result = handleErrorWithRetry(error, mockT);
      expect(result).toBe('authentication_error');
    });

    it('handles authorization errors', () => {
      const error = { response: { status: 403 } };
      const result = handleErrorWithRetry(error, mockT);
      expect(result).toBe('authorization_error');
    });

    it('handles validation errors', () => {
      const error = { response: { status: 400 }, message: 'Invalid input' };
      const result = handleErrorWithRetry(error, mockT);
      expect(result).toBe('Invalid input');
    });

    it('handles rate limiting', () => {
      const error = { response: { status: 429 } };
      const result = handleErrorWithRetry(error, mockT);
      expect(result).toBe('rate_limit_error');
    });

    it('handles Appwrite specific errors', () => {
      const error = { type: 'user_already_exists' };
      const result = handleErrorWithRetry(error, mockT);
      expect(result).toBe('user_already_exists');
    });

    it('falls back to unknown error', () => {
      const error = { message: 'Some random error' };
      const result = handleErrorWithRetry(error, mockT);
      expect(result).toBe('Some random error');
    });

    it('falls back to unknown_error when no message', () => {
      const error = {};
      const result = handleErrorWithRetry(error, mockT);
      expect(result).toBe('unknown_error');
    });
  });
});

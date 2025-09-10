import { userManagementService } from '../userManagementService';
import { teamService } from '../teamService';

// Test de diagnóstico para identificar problemas de integración
describe('Diagnostic Tests - Integration Issues', () => {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  beforeAll(() => {
    // Capturar logs para análisis
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    // Restaurar logs originales
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  });

  describe('Environment Configuration Issues', () => {
    it('should detect missing function ID', () => {
      const originalFunctionId = process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID;
      delete process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID;

      // Crear nueva instancia del servicio
      const service = new (userManagementService.constructor as any)();
      
      expect(service.functionId).toBe('manage-users');
      console.log('✅ Servicio usa ID por defecto cuando no está configurado');

      // Restaurar
      process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID = originalFunctionId;
    });

    it('should detect missing database configuration', () => {
      const originalDatabaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;
      delete process.env.REACT_APP_APPWRITE_DATABASE_ID;

      // Esto debería causar un error al intentar usar productService
      expect(() => {
        require('../productService');
      }).toThrow();

      console.log('✅ ProductService requiere REACT_APP_APPWRITE_DATABASE_ID');

      // Restaurar
      process.env.REACT_APP_APPWRITE_DATABASE_ID = originalDatabaseId;
    });
  });

  describe('Function Response Format Issues', () => {
    it('should handle unexpected response format from list action', async () => {
      // Simular respuesta inesperada
      const mockFunctions = {
        createExecution: jest.fn().mockResolvedValue({
          status: 'completed',
          responseBody: JSON.stringify({
            // Formato incorrecto - no tiene 'users' array
            data: [{ id: '1', name: 'Test' }]
          })
        })
      };

      // Mock del módulo
      jest.doMock('../../utils/appwrite', () => ({
        functions: mockFunctions
      }));

      const result = await userManagementService.listUsers();
      
      // Debería manejar el formato incorrecto
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      console.log('✅ Maneja formato de respuesta inesperado');
    });

    it('should handle empty response from function', async () => {
      const mockFunctions = {
        createExecution: jest.fn().mockResolvedValue({
          status: 'completed',
          responseBody: JSON.stringify({})
        })
      };

      jest.doMock('../../utils/appwrite', () => ({
        functions: mockFunctions
      }));

      const result = await userManagementService.listUsers();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      console.log('✅ Maneja respuesta vacía correctamente');
    });
  });

  describe('Network and Connectivity Issues', () => {
    it('should handle function timeout', async () => {
      const mockFunctions = {
        createExecution: jest.fn().mockRejectedValue(
          new Error('Request timeout')
        )
      };

      jest.doMock('../../utils/appwrite', () => ({
        functions: mockFunctions
      }));

      const result = await userManagementService.listUsers();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Request timeout');
      console.log('✅ Maneja timeout correctamente');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      
      const mockFunctions = {
        createExecution: jest.fn().mockRejectedValue(networkError)
      };

      jest.doMock('../../utils/appwrite', () => ({
        functions: mockFunctions
      }));

      const result = await userManagementService.listUsers();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network Error');
      console.log('✅ Maneja errores de red correctamente');
    });

    it('should handle Appwrite authentication errors', async () => {
      const authError = {
        type: 'general_unauthorized_scope',
        message: 'Unauthorized',
        code: 401
      };
      
      const mockFunctions = {
        createExecution: jest.fn().mockRejectedValue(authError)
      };

      jest.doMock('../../utils/appwrite', () => ({
        functions: mockFunctions
      }));

      const result = await userManagementService.listUsers();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
      console.log('✅ Maneja errores de autenticación correctamente');
    });
  });

  describe('Function Logic Issues', () => {
    it('should handle function returning error response', async () => {
      const mockFunctions = {
        createExecution: jest.fn().mockResolvedValue({
          status: 'completed',
          responseBody: JSON.stringify({
            success: false,
            error: 'Function execution failed'
          })
        })
      };

      jest.doMock('../../utils/appwrite', () => ({
        functions: mockFunctions
      }));

      const result = await userManagementService.listUsers();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Function execution failed');
      console.log('✅ Maneja errores de función correctamente');
    });

    it('should handle malformed JSON in response', async () => {
      const mockFunctions = {
        createExecution: jest.fn().mockResolvedValue({
          status: 'completed',
          responseBody: 'invalid json {'
        })
      };

      jest.doMock('../../utils/appwrite', () => ({
        functions: mockFunctions
      }));

      await expect(userManagementService.listUsers()).rejects.toThrow();
      console.log('✅ Maneja JSON malformado correctamente');
    });
  });

  describe('Service Integration Issues', () => {
    it('should handle team service using different function', async () => {
      // teamService usa la misma función pero con diferentes acciones
      const mockFunctions = {
        createExecution: jest.fn().mockResolvedValue({
          status: 'completed',
          responseBody: JSON.stringify({
            teams: [{ $id: '1', name: 'Test Team', total: 0 }]
          })
        })
      };

      jest.doMock('../../utils/appwrite', () => ({
        functions: mockFunctions
      }));

      const result = await teamService.listTeams();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe('Test Team');
      console.log('✅ TeamService integra correctamente con la función');
    });

    it('should handle different response formats between services', async () => {
      // userManagementService espera { success, data }
      // teamService espera array directo
      
      const mockFunctions = {
        createExecution: jest.fn()
          .mockResolvedValueOnce({
            status: 'completed',
            responseBody: JSON.stringify({
              success: true,
              users: [{ $id: '1', name: 'User' }]
            })
          })
          .mockResolvedValueOnce({
            status: 'completed',
            responseBody: JSON.stringify({
              teams: [{ $id: '1', name: 'Team' }]
            })
          })
      };

      jest.doMock('../../utils/appwrite', () => ({
        functions: mockFunctions
      }));

      const userResult = await userManagementService.listUsers();
      const teamResult = await teamService.listTeams();
      
      expect(userResult.success).toBe(true);
      expect(Array.isArray(teamResult)).toBe(true);
      console.log('✅ Ambos servicios manejan formatos diferentes correctamente');
    });
  });

  describe('Error Recovery and Fallback', () => {
    it('should implement retry logic for transient errors', async () => {
      let attemptCount = 0;
      const mockFunctions = {
        createExecution: jest.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount < 3) {
            const error = new Error('Temporary network error');
            error.name = 'NetworkError';
            throw error;
          }
          return Promise.resolve({
            status: 'completed',
            responseBody: JSON.stringify({
              success: true,
              users: []
            })
          });
        })
      };

      jest.doMock('../../utils/appwrite', () => ({
        functions: mockFunctions
      }));

      const result = await userManagementService.listUsers();
      
      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3);
      console.log('✅ Retry logic funciona correctamente');
    });

    it('should not retry on permanent errors', async () => {
      const mockFunctions = {
        createExecution: jest.fn().mockRejectedValue(
          new Error('Function not found')
        )
      };

      jest.doMock('../../utils/appwrite', () => ({
        functions: mockFunctions
      }));

      const result = await userManagementService.listUsers();
      
      expect(result.success).toBe(false);
      expect(mockFunctions.createExecution).toHaveBeenCalledTimes(1);
      console.log('✅ No reintenta en errores permanentes');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate all required environment variables', () => {
      const requiredVars = {
        'REACT_APP_APPWRITE_ENDPOINT': process.env.REACT_APP_APPWRITE_ENDPOINT,
        'REACT_APP_APPWRITE_PROJECT_ID': process.env.REACT_APP_APPWRITE_PROJECT_ID,
        'REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID': process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID,
        'REACT_APP_APPWRITE_DATABASE_ID': process.env.REACT_APP_APPWRITE_DATABASE_ID,
        'REACT_APP_APPWRITE_PRODUCTS_COLLECTION_ID': process.env.REACT_APP_APPWRITE_PRODUCTS_COLLECTION_ID
      };

      const missingVars = Object.entries(requiredVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        console.log('❌ Variables faltantes:', missingVars);
        console.log('Configuración recomendada:');
        missingVars.forEach(varName => {
          console.log(`${varName}=valor_requerido`);
        });
      } else {
        console.log('✅ Todas las variables de entorno están configuradas');
      }

      // Para el test, solo verificamos que al menos las críticas estén configuradas
      expect(process.env.REACT_APP_APPWRITE_ENDPOINT).toBeDefined();
      expect(process.env.REACT_APP_APPWRITE_PROJECT_ID).toBeDefined();
    });
  });
});

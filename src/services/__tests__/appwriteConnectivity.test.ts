import { functions } from '../../utils/appwrite';

// Test de conectividad real con Appwrite
describe('Appwrite Connectivity Tests', () => {
  const TEST_FUNCTION_ID = process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID;
  const TEST_TIMEOUT = 10000; // 10 segundos

  beforeAll(() => {
    // Verificar que las variables de entorno estén configuradas
    if (!TEST_FUNCTION_ID) {
      console.warn('REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID no está configurado');
    }
  });

  describe('Function Execution Tests', () => {
    it('should be able to execute manage-users function', async () => {
      if (!TEST_FUNCTION_ID) {
        console.log('Saltando test - función no configurada');
        return;
      }

      const testPayload = {
        action: 'list'
      };

      try {
        const result = await functions.createExecution(
          TEST_FUNCTION_ID,
          JSON.stringify(testPayload),
          false
        );

        console.log('Resultado de la función:', result);
        
        // Verificar que la respuesta tenga la estructura esperada
        expect(result).toBeDefined();
        expect(result.status).toBeDefined();
        expect(result.responseBody).toBeDefined();

        // Si la función está funcionando, debería devolver 'completed' o 'failed'
        expect(['completed', 'failed']).toContain(result.status);

        if (result.status === 'completed') {
          const responseData = JSON.parse(result.responseBody);
          console.log('Datos de respuesta:', responseData);
          
          // Verificar estructura de respuesta para listado de usuarios
          if (responseData.users) {
            expect(Array.isArray(responseData.users)).toBe(true);
          }
        }

      } catch (error) {
        console.error('Error ejecutando función:', error);
        
        // Verificar tipos de errores comunes
        if (error instanceof Error) {
          if (error.message.includes('Function not found')) {
            console.log('❌ La función no existe en Appwrite');
          } else if (error.message.includes('Unauthorized')) {
            console.log('❌ Error de autorización - verificar API key');
          } else if (error.message.includes('timeout')) {
            console.log('❌ Timeout - la función puede estar tardando mucho');
          } else if (error.message.includes('network')) {
            console.log('❌ Error de red - verificar conectividad');
          } else {
            console.log('❌ Error desconocido:', error.message);
          }
        }
        
        throw error;
      }
    }, TEST_TIMEOUT);

    it('should handle team list action', async () => {
      if (!TEST_FUNCTION_ID) {
        console.log('Saltando test - función no configurada');
        return;
      }

      const testPayload = {
        action: 'teamList'
      };

      try {
        const result = await functions.createExecution(
          TEST_FUNCTION_ID,
          JSON.stringify(testPayload),
          false
        );

        console.log('Resultado teamList:', result);

        if (result.status === 'completed') {
          const responseData = JSON.parse(result.responseBody);
          console.log('Equipos encontrados:', responseData);
          
          if (responseData.teams) {
            expect(Array.isArray(responseData.teams)).toBe(true);
          }
        }

      } catch (error) {
        console.error('Error en teamList:', error);
        throw error;
      }
    }, TEST_TIMEOUT);

    it('should handle invalid action gracefully', async () => {
      if (!TEST_FUNCTION_ID) {
        console.log('Saltando test - función no configurada');
        return;
      }

      const testPayload = {
        action: 'invalidAction'
      };

      try {
        const result = await functions.createExecution(
          TEST_FUNCTION_ID,
          JSON.stringify(testPayload),
          false
        );

        console.log('Resultado con acción inválida:', result);

        // La función debería manejar acciones inválidas
        if (result.status === 'completed') {
          const responseData = JSON.parse(result.responseBody);
          expect(responseData.error).toBeDefined();
        }

      } catch (error) {
        console.error('Error con acción inválida:', error);
        // Esto es esperado para acciones inválidas
      }
    }, TEST_TIMEOUT);
  });

  describe('Configuration Validation', () => {
    it('should have required environment variables', () => {
      const requiredVars = [
        'REACT_APP_APPWRITE_ENDPOINT',
        'REACT_APP_APPWRITE_PROJECT_ID',
        'REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID'
      ];

      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.log('❌ Variables de entorno faltantes:', missingVars);
        console.log('Configura estas variables en tu archivo .env:');
        missingVars.forEach(varName => {
          console.log(`${varName}=tu_valor_aqui`);
        });
      }

      expect(missingVars).toHaveLength(0);
    });

    it('should have valid Appwrite endpoint format', () => {
      const endpoint = process.env.REACT_APP_APPWRITE_ENDPOINT;
      
      if (endpoint) {
        expect(endpoint).toMatch(/^https?:\/\/.+/);
        console.log('✅ Endpoint válido:', endpoint);
      } else {
        console.log('❌ REACT_APP_APPWRITE_ENDPOINT no configurado');
      }
    });

    it('should have valid project ID format', () => {
      const projectId = process.env.REACT_APP_APPWRITE_PROJECT_ID;
      
      if (projectId) {
        // Los IDs de Appwrite suelen ser strings de 24 caracteres
        expect(projectId).toMatch(/^[a-zA-Z0-9]{20,}$/);
        console.log('✅ Project ID válido:', projectId);
      } else {
        console.log('❌ REACT_APP_APPWRITE_PROJECT_ID no configurado');
      }
    });
  });

  describe('Performance Tests', () => {
    it('should execute function within reasonable time', async () => {
      if (!TEST_FUNCTION_ID) {
        console.log('Saltando test - función no configurada');
        return;
      }

      const startTime = Date.now();
      
      try {
        await functions.createExecution(
          TEST_FUNCTION_ID,
          JSON.stringify({ action: 'list' }),
          false
        );
        
        const executionTime = Date.now() - startTime;
        console.log(`⏱️ Tiempo de ejecución: ${executionTime}ms`);
        
        // La función debería ejecutarse en menos de 10 segundos
        expect(executionTime).toBeLessThan(10000);
        
        if (executionTime > 5000) {
          console.log('⚠️ La función está tardando más de 5 segundos');
        }
        
      } catch (error) {
        console.error('Error en test de rendimiento:', error);
        throw error;
      }
    }, TEST_TIMEOUT);
  });
});

import React, { useState } from 'react';
import { Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { userManagementService } from '../../services/userManagementService';

const UserDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testListUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing listUsers...');
      const result = await userManagementService.listUsers();
      console.log('ListUsers result:', result);
      setDebugInfo({ operation: 'listUsers', result });
    } catch (err) {
      console.error('Error testing listUsers:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testCreateUser = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing createUser...');
      const result = await userManagementService.createUser({
        email: 'test@example.com',
        password: 'testpassword123',
        name: 'Test User'
      });
      console.log('CreateUser result:', result);
      setDebugInfo({ operation: 'createUser', result });
    } catch (err) {
      console.error('Error testing createUser:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironment = () => {
    const envInfo = {
      REACT_APP_APPWRITE_ENDPOINT: process.env.REACT_APP_APPWRITE_ENDPOINT,
      REACT_APP_APPWRITE_PROJECT_ID: process.env.REACT_APP_APPWRITE_PROJECT_ID,
      REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID: process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID,
    };
    setDebugInfo({ operation: 'environment', result: envInfo });
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>User Management Debug</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <Button 
                  variant="primary" 
                  onClick={testListUsers} 
                  disabled={loading}
                  className="me-2"
                >
                  Test List Users
                </Button>
                <Button 
                  variant="success" 
                  onClick={testCreateUser} 
                  disabled={loading}
                  className="me-2"
                >
                  Test Create User
                </Button>
                <Button 
                  variant="info" 
                  onClick={checkEnvironment} 
                  disabled={loading}
                >
                  Check Environment
                </Button>
              </div>

              {loading && (
                <Alert variant="info">
                  Testing... Check console for logs
                </Alert>
              )}

              {error && (
                <Alert variant="danger">
                  Error: {error}
                </Alert>
              )}

              {debugInfo && (
                <Alert variant="success">
                  <h6>Debug Info - {debugInfo.operation}</h6>
                  <pre style={{ fontSize: '12px', maxHeight: '400px', overflow: 'auto' }}>
                    {JSON.stringify(debugInfo.result, null, 2)}
                  </pre>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserDebug;


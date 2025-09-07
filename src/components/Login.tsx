import React from 'react';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { validationRules } from '../utils/validation';
import { withRetry } from '../utils/retryLogic';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const { 
        values, 
        fields, 
        isSubmitting, 
        submitError, 
        handleSubmit, 
        getFieldProps 
    } = useFormValidation({
        initialValues: { email: '', password: '' },
        validationRules: {
            email: validationRules.email,
            password: { required: true, minLength: 1 } // Don't require strong password for login
        },
        onSubmit: async (values) => {
            await withRetry(async () => {
                await login(values.email, values.password);
                navigate('/dashboard');
            }, {
                maxRetries: 2,
                delay: 1000
            });
        }
    });

    const emailProps = getFieldProps('email');
    const passwordProps = getFieldProps('password');

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <Row className="justify-content-center w-100">
                <Col xs={12} md={6} lg={4}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Log In</h2>
                            {submitError && <Alert variant="danger">{submitError}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        {...emailProps}
                                        placeholder="Enter your email"
                                    />
                                    {emailProps.errors.length > 0 && (
                                        <Form.Text className="text-danger">
                                            {emailProps.errors[0]}
                                        </Form.Text>
                                    )}
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        {...passwordProps}
                                        placeholder="Enter your password"
                                    />
                                    {passwordProps.errors.length > 0 && (
                                        <Form.Text className="text-danger">
                                            {passwordProps.errors[0]}
                                        </Form.Text>
                                    )}
                                </Form.Group>
                                <Button 
                                    className="w-100 mt-3" 
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <LoadingSpinner size="sm" text="Signing in..." />
                                    ) : (
                                        'Log In'
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    <div className="w-100 text-center mt-2">
                        Need an account? <Link to="/signup">Sign Up</Link>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;

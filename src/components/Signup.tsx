import React from 'react';
import { account } from '../utils/appwrite';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ID } from 'appwrite';
import { useFormValidation } from '../hooks/useFormValidation';
import { validationRules } from '../utils/validation';
import { withRetry } from '../utils/retryLogic';
import LoadingSpinner from './common/LoadingSpinner';

const Signup = () => {
    const navigate = useNavigate();

    const { 
        values, 
        fields, 
        isSubmitting, 
        submitError, 
        handleSubmit, 
        getFieldProps 
    } = useFormValidation({
        initialValues: { name: '', email: '', password: '' },
        validationRules: {
            name: validationRules.name,
            email: validationRules.email,
            password: validationRules.password
        },
        onSubmit: async (values) => {
            await withRetry(async () => {
                await account.create(ID.unique(), values.email, values.password, values.name);
                await account.createEmailPasswordSession(values.email, values.password);
                navigate('/dashboard');
            }, {
                maxRetries: 2,
                delay: 1000
            });
        }
    });

    const nameProps = getFieldProps('name');
    const emailProps = getFieldProps('email');
    const passwordProps = getFieldProps('password');

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <div className="w-100" style={{ maxWidth: "400px" }}>
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Sign Up</h2>
                        {submitError && <Alert variant="danger">{submitError}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    {...nameProps}
                                    placeholder="Enter your full name"
                                />
                                {nameProps.errors.length > 0 && (
                                    <Form.Text className="text-danger">
                                        {nameProps.errors[0]}
                                    </Form.Text>
                                )}
                            </Form.Group>
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
                                    placeholder="Enter a strong password"
                                />
                                {passwordProps.errors.length > 0 && (
                                    <Form.Text className="text-danger">
                                        {passwordProps.errors[0]}
                                    </Form.Text>
                                )}
                                <Form.Text className="text-muted">
                                    Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                                </Form.Text>
                            </Form.Group>
                            <Button disabled={isSubmitting} className="w-100 mt-3" type="submit">
                                {isSubmitting ? (
                                    <LoadingSpinner size="sm" text="Creating account..." />
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
                <div className="w-100 text-center mt-2">
                    Already have an account? <Link to="/login">Log In</Link>
                </div>
            </div>
        </Container>
    );
};

export default Signup;

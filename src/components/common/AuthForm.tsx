import React from 'react';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useFormField } from '../../hooks/useFormField';
import { validationRules } from '../../utils/validation';
import { withRetry } from '../../utils/retryLogic';
import LoadingSpinner from './LoadingSpinner';
import FormField from './FormField';
import { account } from '../../utils/appwrite';
import { ID } from 'appwrite';

export type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  mode: AuthMode;
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const isLogin = mode === 'login';

  const { 
    isSubmitting, 
    submitError, 
    handleSubmit, 
    createFieldProps 
  } = useFormField({
    initialValues: isLogin 
      ? { email: '', password: '' } 
      : { name: '', email: '', password: '' },
    validationRules: isLogin 
      ? {
          email: validationRules.email,
          password: { required: true, minLength: 1 }
        }
      : {
          name: validationRules.name,
          email: validationRules.email,
          password: validationRules.password
        },
    onSubmit: async (values) => {
      await withRetry(async () => {
        if (isLogin) {
          await login(values.email, values.password);
        } else {
          await account.create(ID.unique(), values.email, values.password, values.name);
          await account.createEmailPasswordSession(values.email, values.password);
        }
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/dashboard');
        }
      }, {
        maxRetries: 2,
        delay: 1000
      });
    }
  });

  const nameProps = !isLogin ? createFieldProps('name') : null;
  const emailProps = createFieldProps('email');
  const passwordProps = createFieldProps('password');

  const title = isLogin ? t('log_in') : t('sign_up');
  const submitText = isSubmitting 
    ? (isLogin ? t('signing_in') : t('creating_account'))
    : title;
  const linkText = isLogin ? t('need_an_account') : t('already_have_account');
  const linkTo = isLogin ? '/signup' : '/login';
  const linkLabel = isLogin ? t('sign_up') : t('log_in');

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Row className="justify-content-center w-100">
        <Col xs={12} md={6} lg={4}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">{title}</h2>
              {submitError && <Alert variant="danger">{submitError}</Alert>}
              <Form onSubmit={handleSubmit}>
                {!isLogin && nameProps && (
                  <FormField
                    label={t('name')}
                    type="text"
                    placeholder={t('enter_your_full_name')}
                    {...nameProps}
                  />
                )}
                
                <FormField
                  label={t('email')}
                  type="email"
                  placeholder={t('enter_your_email')}
                  required
                  {...emailProps}
                />
                
                <FormField
                  label={t('password')}
                  type="password"
                  placeholder={isLogin ? t('enter_your_password') : t('enter_strong_password')}
                  required
                  helpText={!isLogin ? t('password_requirements') : undefined}
                  {...passwordProps}
                />
                
                <Button 
                  className="w-100 mt-3" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" text={submitText} />
                  ) : (
                    title
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <div className="w-100 text-center mt-2">
            {linkText} <Link to={linkTo}>{linkLabel}</Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthForm;

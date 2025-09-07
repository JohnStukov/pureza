import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  variant: 'primary' | 'success' | 'warning' | 'info' | 'secondary';
}

export const QuickActions: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      id: 'create_user',
      title: t('create_user'),
      description: t('create_user_description'),
      icon: '👤',
      path: '/settings/users',
      variant: 'primary'
    },
    {
      id: 'create_product',
      title: t('add_product'),
      description: t('create_product_description'),
      icon: '📦',
      path: '/settings/products',
      variant: 'success'
    },
    {
      id: 'create_team',
      title: t('create_team'),
      description: t('create_team_description'),
      icon: '👥',
      path: '/settings/teams',
      variant: 'info'
    },
    {
      id: 'manage_settings',
      title: t('manage_settings'),
      description: t('manage_settings_description'),
      icon: '⚙️',
      path: '/settings',
      variant: 'secondary'
    }
  ];

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-0">{t('quick_actions')}</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          {quickActions.map((action) => (
            <Col md={6} className="mb-3" key={action.id}>
              <Button
                variant={action.variant}
                className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3"
                onClick={() => handleActionClick(action.path)}
                style={{ minHeight: '120px' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {action.icon}
                </div>
                <div className="fw-bold">{action.title}</div>
                <small className="opacity-75">{action.description}</small>
              </Button>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default QuickActions;

import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  trend,
  subtitle
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      case 'info': return 'text-info';
      default: return 'text-primary';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend.isPositive ? '↗️' : '↘️';
  };

  const getTrendClass = () => {
    if (!trend) return '';
    return trend.isPositive ? 'text-success' : 'text-danger';
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center">
              {icon && (
                <div className={`me-3 ${getColorClass()}`} style={{ fontSize: '1.5rem' }}>
                  {icon}
                </div>
              )}
              <div>
                <h6 className="card-title mb-1" style={{ color: 'var(--card-text-muted)' }}>{title}</h6>
                <h3 className={`mb-0 ${getColorClass()}`}>{value}</h3>
                {subtitle && (
                  <small style={{ color: 'var(--card-text-muted)' }}>{subtitle}</small>
                )}
                {trend && (
                  <div className={`small ${getTrendClass()}`}>
                    {getTrendIcon()} {Math.abs(trend.value)}%
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;

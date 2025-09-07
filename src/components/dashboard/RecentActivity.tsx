import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';

interface ActivityItem {
  id: string;
  type: 'user_created' | 'user_updated' | 'product_created' | 'product_updated' | 'product_deleted' | 'team_created' | 'team_updated';
  description: string;
  timestamp: string;
  user?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  maxItems = 10
}) => {
  const { t } = useLanguage();

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_created':
      case 'user_updated':
        return '👤';
      case 'product_created':
      case 'product_updated':
      case 'product_deleted':
        return '📦';
      case 'team_created':
      case 'team_updated':
        return '👥';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_created':
      case 'product_created':
      case 'team_created':
        return 'success';
      case 'user_updated':
      case 'product_updated':
      case 'team_updated':
        return 'primary';
      case 'product_deleted':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('just_now');
    if (diffInMinutes < 60) return t('minutes_ago', { minutes: diffInMinutes });
    if (diffInMinutes < 1440) return t('hours_ago', { hours: Math.floor(diffInMinutes / 60) });
    return t('days_ago', { days: Math.floor(diffInMinutes / 1440) });
  };

  const recentActivities = activities.slice(0, maxItems);

  return (
    <Card className="h-100">
      <Card.Header>
        <h5 className="mb-0">{t('recent_activity')}</h5>
      </Card.Header>
      <Card.Body className="p-0">
        {recentActivities.length === 0 ? (
          <div className="text-center p-4" style={{ color: 'var(--card-text-muted)' }}>
            {t('no_recent_activity')}
          </div>
        ) : (
          <ListGroup variant="flush">
            {recentActivities.map((activity) => (
              <ListGroup.Item key={activity.id} className="d-flex align-items-center">
                <div className="me-3" style={{ fontSize: '1.2rem' }}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <span className="fw-medium">{activity.description}</span>
                      {activity.user && (
                        <div className="small" style={{ color: 'var(--card-text-muted)' }}>by {activity.user}</div>
                      )}
                    </div>
                    <div className="text-end">
                      <Badge bg={getActivityColor(activity.type)} className="mb-1">
                        {t(activity.type)}
                      </Badge>
                      <div className="small" style={{ color: 'var(--card-text-muted)' }}>
                        {formatTimestamp(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecentActivity;

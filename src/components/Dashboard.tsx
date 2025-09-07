import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { functions } from '../utils/appwrite';
import { withRetry } from '../utils/retryLogic';
import { handleError } from '../utils/errorHandler';
import LoadingSpinner from './common/LoadingSpinner';
import StatsCard from './dashboard/StatsCard';
import RecentActivity from './dashboard/RecentActivity';
import QuickActions from './dashboard/QuickActions';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalTeams: number;
  activeUsers: number;
}

interface ActivityItem {
  id: string;
  type: 'user_created' | 'user_updated' | 'product_created' | 'product_updated' | 'product_deleted' | 'team_created' | 'team_updated';
  description: string;
  timestamp: string;
  user?: string;
}

const Dashboard = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalProducts: 0,
        totalTeams: 0,
        activeUsers: 0
    });
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch users data
            const usersResponse = await withRetry(
                () => functions.createExecution(
                    process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID!,
                    JSON.stringify({ action: 'list' }),
                    false
                ),
                { maxRetries: 2, delay: 1000 }
            );
            const usersResult = JSON.parse(usersResponse.responseBody);
            const users = Array.isArray(usersResult.users) ? usersResult.users : [];

            // Fetch products data
            const products = await withRetry(
                () => productService.listProducts(),
                { maxRetries: 2, delay: 1000 }
            );

            // Fetch teams data
            const teamsResponse = await withRetry(
                () => functions.createExecution(
                    process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID!,
                    JSON.stringify({ action: 'teamList' }),
                    false
                ),
                { maxRetries: 2, delay: 1000 }
            );
            const teamsResult = JSON.parse(teamsResponse.responseBody);
            const teams = Array.isArray(teamsResult.teams) ? teamsResult.teams : [];

            // Calculate stats
            const activeUsers = users.filter((user: any) => user.status).length;
            
            setStats({
                totalUsers: users.length,
                totalProducts: products.length,
                totalTeams: teams.length,
                activeUsers
            });

            // Generate mock recent activities (in a real app, this would come from an API)
            const mockActivities: ActivityItem[] = [
                {
                    id: '1',
                    type: 'user_created',
                    description: t('new_user_registered'),
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    user: 'Admin'
                },
                {
                    id: '2',
                    type: 'product_created',
                    description: t('new_product_added'),
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    user: 'Admin'
                },
                {
                    id: '3',
                    type: 'team_created',
                    description: t('new_team_created'),
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
                    user: 'Admin'
                }
            ];
            setActivities(mockActivities);

        } catch (err: any) {
            setError(handleError(err, t));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const statsCards = useMemo(() => [
        {
            title: t('total_users'),
            value: stats.totalUsers,
            icon: '👥',
            color: 'primary' as const,
            subtitle: `${stats.activeUsers} ${t('active')}`
        },
        {
            title: t('total_products'),
            value: stats.totalProducts,
            icon: '📦',
            color: 'success' as const,
            subtitle: t('in_catalog')
        },
        {
            title: t('total_teams'),
            value: stats.totalTeams,
            icon: '👥',
            color: 'info' as const,
            subtitle: t('organized')
        },
        {
            title: t('active_users'),
            value: stats.activeUsers,
            icon: '✅',
            color: 'warning' as const,
            subtitle: `${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% ${t('of_total')}`
        }
    ], [stats, t]);

    if (loading) {
        return (
            <Container fluid className="mt-4">
                <LoadingSpinner text={t('loading_dashboard')} centered />
            </Container>
        );
    }

    return (
        <Container fluid className="mt-4">
            <Row className="mb-4">
                <Col>
                    <h1 className="h3 mb-1">{t('dashboard_title')}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {t('welcome_back')}, {currentUser?.name || currentUser?.email}!
                    </p>
                </Col>
            </Row>

            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger">{error}</Alert>
                    </Col>
                </Row>
            )}

            {/* Stats Cards */}
            <Row className="mb-4">
                {statsCards.map((stat, index) => (
                    <Col lg={3} md={6} className="mb-3" key={index}>
                        <StatsCard {...stat} />
                    </Col>
                ))}
            </Row>

            {/* Dashboard Content */}
            <Row>
                <Col lg={8} className="mb-4">
                    <RecentActivity activities={activities} />
                </Col>
                <Col lg={4} className="mb-4">
                    <QuickActions />
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;

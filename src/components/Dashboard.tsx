import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { productService, Product } from '../services/productService';
import { userManagementService, AppwriteUser, AppwriteTeam } from '../services/userManagementService';
import { handleError } from '../utils/errorHandler';
import LoadingSpinner from './common/LoadingSpinner';
import StatsCard from './dashboard/StatsCard';
import RecentActivity from './dashboard/RecentActivity';
import QuickActions from './dashboard/QuickActions';
import toast from 'react-hot-toast';

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
    const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalProducts: 0, totalTeams: 0, activeUsers: 0 });
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                userManagementService.listUsers(),
                productService.listProducts(),
                userManagementService.listTeams(),
            ]);

            const [usersResult, productsResult, teamsResult] = results;

            let users: AppwriteUser[] = [];
            if (usersResult.status === 'fulfilled' && usersResult.value.success) {
                users = usersResult.value.data || [];
            } else if (usersResult.status === 'rejected' || (usersResult.status === 'fulfilled' && !usersResult.value.success)) {
                toast.error(t('error_loading_users'));
                console.error("User fetch error:", usersResult.status === 'fulfilled' ? usersResult.value.error : usersResult.reason);
            }

            let products: Product[] = [];
            if (productsResult.status === 'fulfilled') {
                products = productsResult.value || [];
            } else {
                toast.error(t('error_loading_products'));
                console.error("Product fetch error:", productsResult.reason);
            }

            let teams: AppwriteTeam[] = [];
            if (teamsResult.status === 'fulfilled' && teamsResult.value.success) {
                teams = teamsResult.value.data || [];
            } else if (teamsResult.status === 'rejected' || (teamsResult.status === 'fulfilled' && !teamsResult.value.success)) {
                toast.error(t('error_loading_teams'));
                console.error("Team fetch error:", teamsResult.status === 'fulfilled' ? teamsResult.value.error : teamsResult.reason);
            }

            const activeUsers = users.filter((user) => user.status).length;
            
            setStats({
                totalUsers: users.length,
                totalProducts: products.length,
                totalTeams: teams.length,
                activeUsers
            });

            // Mock activities can remain as they are
            const mockActivities: ActivityItem[] = [
                { id: '1', type: 'user_created', description: t('new_user_registered'), timestamp: new Date().toISOString(), user: 'Admin' },
            ];
            setActivities(mockActivities);

        } catch (err: any) {
            toast.error(handleError(err, t));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

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
        return <LoadingSpinner text={t('loading_dashboard')} centered />;
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

            <Row className="mb-4">
                {statsCards.map((stat, index) => (
                    <Col lg={3} md={6} className="mb-3" key={index}>
                        <StatsCard {...stat} />
                    </Col>
                ))}
            </Row>

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

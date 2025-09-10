import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { teamService } from '../services/teamService';
import { handleError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

interface TeamInvitationProps {
    membershipId: string;
    teamId: string;
    userId: string;
    secret: string;
}

const TeamInvitation: React.FC = () => {
    const { t } = useLanguage();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [invitationData, setInvitationData] = useState<any>(null);

    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const membershipId = urlParams.get('membershipId');
    const teamId = urlParams.get('teamId');
    const userId = urlParams.get('userId');
    const secret = urlParams.get('secret');

    useEffect(() => {
        if (!membershipId || !teamId || !userId || !secret) {
            setError(t('invalid_invitation_link'));
            setLoading(false);
            return;
        }

        // Verificar que el usuario esté autenticado
        if (!currentUser) {
            setError(t('login_required_for_invitation'));
            setLoading(false);
            return;
        }

        // Verificar que el usuario de la invitación coincida con el usuario autenticado
        if (currentUser.$id !== userId) {
            setError(t('invitation_not_for_current_user'));
            setLoading(false);
            return;
        }

        setInvitationData({ membershipId, teamId, userId, secret });
        setLoading(false);
    }, [currentUser, membershipId, teamId, userId, secret, t]);

    const handleAcceptInvitation = async () => {
        if (!invitationData) return;

        setAccepting(true);
        try {
            // Aceptar la invitación usando el servicio de equipos
            await teamService.acceptInvitation({
                membershipId: invitationData.membershipId,
                secret: invitationData.secret
            });

            toast.success(t('invitation_accepted_successfully'));
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error accepting invitation:', error);
            setError(handleError(error, t));
        } finally {
            setAccepting(false);
        }
    };

    const handleDeclineInvitation = async () => {
        if (!invitationData) return;

        setAccepting(true);
        try {
            // Rechazar la invitación
            await teamService.declineInvitation({
                membershipId: invitationData.membershipId,
                secret: invitationData.secret
            });

            toast.success(t('invitation_declined'));
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error declining invitation:', error);
            setError(handleError(error, t));
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <Container className="mt-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className="text-center">
                            <Card.Body>
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">{t('loading')}</span>
                                </Spinner>
                                <p className="mt-3">{t('loading_invitation')}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card>
                            <Card.Body>
                                <Alert variant="danger">
                                    <h4>{t('invitation_error')}</h4>
                                    <p>{error}</p>
                                </Alert>
                                <Button 
                                    variant="primary" 
                                    onClick={() => navigate('/dashboard')}
                                >
                                    {t('go_to_dashboard')}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h3>{t('team_invitation')}</h3>
                        </Card.Header>
                        <Card.Body>
                            <p>{t('invitation_message')}</p>
                            
                            <div className="d-grid gap-2">
                                <Button 
                                    variant="success" 
                                    size="lg"
                                    onClick={handleAcceptInvitation}
                                    disabled={accepting}
                                >
                                    {accepting ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            {t('accepting_invitation')}
                                        </>
                                    ) : (
                                        t('accept_invitation')
                                    )}
                                </Button>
                                
                                <Button 
                                    variant="outline-danger" 
                                    size="lg"
                                    onClick={handleDeclineInvitation}
                                    disabled={accepting}
                                >
                                    {accepting ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            {t('declining_invitation')}
                                        </>
                                    ) : (
                                        t('decline_invitation')
                                    )}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default TeamInvitation;

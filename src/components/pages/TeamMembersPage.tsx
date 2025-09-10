import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import TeamMembers from '../settings/TeamMembers';

const TeamMembersPage: React.FC = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    
    const teamName = location.state?.teamName || 'Equipo';

    const handleClose = () => {
        navigate('/settings');
    };

    if (!teamId) {
        return (
            <Container fluid>
                <Row>
                    <Col>
                        <div className="text-center py-5">
                            <h3>{t('team_not_found')}</h3>
                            <Button variant="primary" onClick={handleClose}>
                                {t('go_back')}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container fluid>
            <Row className="mb-3">
                <Col>
                    <div className="d-flex align-items-center gap-3">
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleClose}
                            className="d-flex align-items-center gap-2"
                        >
                            <i className="fas fa-arrow-left"></i>
                            {t('go_back')}
                        </Button>
                        <h3 className="mb-0">
                            <i className="fas fa-users me-2"></i>
                            {t('manage_team_members')}
                        </h3>
                    </div>
                </Col>
            </Row>
            
            <TeamMembers 
                teamId={teamId} 
                teamName={teamName} 
                onClose={handleClose} 
            />
        </Container>
    );
};

export default TeamMembersPage;

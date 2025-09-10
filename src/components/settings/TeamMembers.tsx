import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Table, Form, Alert, Badge, Modal } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { teamService } from '../../services/teamService';
import { userManagementService, AppwriteUser } from '../../services/userManagementService';
import { handleError } from '../../utils/errorHandler';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

interface TeamMember {
    $id: string;
    userId: string;
    userName: string;
    userEmail: string;
    roles: string[];
    joinedAt: string;
}

interface TeamMembersProps {
    teamId: string;
    teamName: string;
    onClose: () => void;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ teamId, teamName, onClose }) => {
    const { t } = useLanguage();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [availableUsers, setAvailableUsers] = useState<AppwriteUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>(['member']);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const membersList = await teamService.listMembers({ teamId });
            setMembers(membersList);
        } catch (error: any) {
            toast.error(handleError(error, t));
        } finally {
            setLoading(false);
        }
    }, [teamId, t]);

    const fetchAvailableUsers = useCallback(async () => {
        try {
            const result = await userManagementService.listUsers();
            if (result.success && result.data) {
                // Filtrar usuarios que no están ya en el equipo
                const memberUserIds = members.map(m => m.userId);
                const available = result.data.filter(user => !memberUserIds.includes(user.$id));
                setAvailableUsers(available);
                console.log('Available users loaded:', available.length);
            } else {
                console.error('Failed to load users:', result.error);
                setAvailableUsers([]);
            }
        } catch (error: any) {
            console.error('Error fetching users:', error);
            toast.error(handleError(error, t));
            setAvailableUsers([]);
        }
    }, [members, t]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    useEffect(() => {
        fetchAvailableUsers();
    }, [fetchAvailableUsers]);

    useEffect(() => {
        if (showAddModal) {
            fetchAvailableUsers();
        }
    }, [showAddModal, fetchAvailableUsers]);

    const handleAddMember = async () => {
        if (!selectedUserId) {
            toast.error(t('select_user_to_add'));
            return;
        }

        // Encontrar el usuario seleccionado para obtener su email
        const selectedUser = availableUsers.find(user => user.$id === selectedUserId);
        if (!selectedUser) {
            toast.error(t('user_not_found'));
            return;
        }

        try {
            await teamService.addMember({
                teamId,
                userEmail: selectedUser.email, // Enviar el email del usuario seleccionado
                roles: selectedRoles
            });
            
            toast.success(t('member_added_successfully'));
            setShowAddModal(false);
            setSelectedUserId('');
            setSelectedRoles(['member']);
            fetchMembers();
        } catch (error: any) {
            toast.error(handleError(error, t));
        }
    };

    const handleRemoveMember = async (membershipId: string, userName: string) => {
        if (!window.confirm(t('confirm_remove_member', { userName }))) {
            return;
        }

        try {
            await teamService.removeMember({
                teamId,
                membershipId
            });
            
            toast.success(t('member_removed_successfully'));
            fetchMembers();
        } catch (error: any) {
            toast.error(handleError(error, t));
        }
    };

    const handleUpdateRole = async (membershipId: string, newRoles: string[]) => {
        try {
            await teamService.updateMemberRole({
                teamId,
                membershipId,
                roles: newRoles
            });
            
            toast.success(t('member_role_updated_successfully'));
            fetchMembers();
        } catch (error: any) {
            toast.error(handleError(error, t));
        }
    };

    const toggleRole = (role: string) => {
        setSelectedRoles(prev => 
            prev.includes(role) 
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'owner': return 'danger';
            case 'admin': return 'warning';
            case 'member': return 'primary';
            default: return 'secondary';
        }
    };

    if (loading) {
        return <LoadingSpinner text={t('loading_members')} centered />;
    }

    return (
        <Container fluid>
            <Row className="mb-3">
                <Col>
                    <h4>{t('team_members')}: {teamName}</h4>
                    <div className="d-flex align-items-center gap-3">
                        <Button 
                            variant="primary" 
                            onClick={() => setShowAddModal(true)}
                            disabled={availableUsers.length === 0}
                        >
                            {t('add_member')}
                        </Button>
                        {availableUsers.length > 0 && (
                            <small className="text-muted">
                                {availableUsers.length} {t('users_available_to_add')}
                            </small>
                        )}
                        {availableUsers.length === 0 && (
                            <small className="text-muted">
                                {t('no_users_available_to_add')}
                            </small>
                        )}
                    </div>
                </Col>
            </Row>

            {members.length === 0 ? (
                <Alert variant="info">
                    {t('no_members_in_team')}
                </Alert>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>{t('user_name')}</th>
                            <th>{t('email')}</th>
                            <th>{t('roles')}</th>
                            <th>{t('joined_at')}</th>
                            <th>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => (
                            <tr key={member.$id}>
                                <td>{member.userName}</td>
                                <td>{member.userEmail}</td>
                                <td>
                                    {member.roles.map(role => (
                                        <Badge 
                                            key={role} 
                                            bg={getRoleBadgeVariant(role)} 
                                            className="me-1"
                                        >
                                            {role}
                                        </Badge>
                                    ))}
                                </td>
                                <td>{new Date(member.joinedAt).toLocaleDateString()}</td>
                                <td>
                                    <Button 
                                        variant="danger" 
                                        size="sm"
                                        onClick={() => handleRemoveMember(member.$id, member.userName)}
                                    >
                                        {t('remove')}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Modal para agregar miembro */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('add_member_to_team')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('select_user')}</Form.Label>
                        <Form.Select 
                            value={selectedUserId} 
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">{t('choose_user')}</option>
                            {availableUsers.map(user => (
                                <option key={user.$id} value={user.$id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>{t('roles')}</Form.Label>
                        <div>
                            {['member', 'admin', 'owner'].map(role => (
                                <Form.Check
                                    key={role}
                                    type="checkbox"
                                    id={`role-${role}`}
                                    label={t(role)}
                                    checked={selectedRoles.includes(role)}
                                    onChange={() => toggleRole(role)}
                                />
                            ))}
                        </div>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        {t('cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleAddMember}>
                        {t('add_member')}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Row className="mt-3">
                <Col>
                    <Button variant="secondary" onClick={onClose}>
                        {t('close')}
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default TeamMembers;

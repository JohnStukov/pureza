import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Alert, Badge } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { teamService } from '../../services/teamService';
import { userManagementService, AppwriteUser } from '../../services/userManagementService';
import { handleError } from '../../utils/errorHandler';
import DataTable, { Column } from '../common/DataTable';
import Modal from '../common/Modal';
import TeamMembersModal from '../common/TeamMembersModal';
import UserSelectField from '../common/UserSelectField';
import RoleSelectField from '../common/RoleSelectField';
import { useModal } from '../../hooks/useModal';
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
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>(['member']);

    // Modal management
    const { modalState, openModal, closeModal } = useModal({
        onOpen: () => {
            setSelectedUserId('');
            setSelectedRoles(['member']);
        },
        onClose: () => {
            setSelectedUserId('');
            setSelectedRoles(['member']);
        }
    });

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
        if (modalState.isOpen) {
            fetchAvailableUsers();
        }
    }, [modalState.isOpen, fetchAvailableUsers]);

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
            closeModal();
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

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return t('invalid_date');
            }
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return t('invalid_date');
        }
    };

    // Define columns for DataTable
    const columns: Column<TeamMember>[] = [
        {
            key: 'userName',
            label: t('user_name'),
            sortable: true
        },
        {
            key: 'userEmail',
            label: t('email'),
            sortable: true
        },
        {
            key: 'roles',
            label: t('roles'),
            render: (roles: string[]) => (
                <>
                    {roles.map(role => (
                        <Badge 
                            key={role} 
                            bg={getRoleBadgeVariant(role)} 
                            className="me-1"
                        >
                            {role}
                        </Badge>
                    ))}
                </>
            )
        },
        {
            key: 'joinedAt',
            label: t('joined_at'),
            sortable: true,
            render: (date: string) => formatDate(date)
        }
    ];

    return (
        <Container fluid>
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-3">
                        {availableUsers.length > 0 ? (
                            <div className="d-flex align-items-center gap-2">
                                <i className="fas fa-info-circle text-info"></i>
                                <small className="text-muted">
                                    {availableUsers.length} {t('users_available_to_add')}
                                </small>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center gap-2">
                                <i className="fas fa-exclamation-triangle text-warning"></i>
                                <small className="text-muted">
                                    {t('no_users_available_to_add')}
                                </small>
                            </div>
                        )}
                    </div>
                    <Button 
                        variant="primary" 
                        onClick={() => openModal('add')}
                        disabled={availableUsers.length === 0}
                        className="d-flex align-items-center gap-2"
                    >
                        <i className="fas fa-plus"></i>
                        {t('add_member')}
                    </Button>
                </div>
            </div>

            <DataTable
                data={members}
                columns={columns}
                loading={loading}
                searchable={true}
                searchPlaceholder={t('search_members_placeholder')}
                sortable={true}
                pagination={true}
                itemsPerPage={10}
                emptyMessage={t('no_members_in_team')}
                actions={(member) => (
                    <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleRemoveMember(member.$id, member.userName)}
                        className="d-flex align-items-center gap-1"
                    >
                        <i className="fas fa-user-minus"></i>
                        {t('remove')}
                    </Button>
                )}
            />

            {/* Modal para agregar miembro */}
            <Modal 
                show={modalState.isOpen} 
                onHide={closeModal}
                title={t('add_member_to_team')}
                size="lg"
                scrollable={true}
                onConfirm={handleAddMember}
                confirmText={t('add_member')}
                cancelText={t('cancel')}
            >
                <div className="mb-3">
                    <UserSelectField
                        users={availableUsers}
                        value={selectedUserId}
                        onChange={setSelectedUserId}
                        placeholder={t('choose_user')}
                        label={t('select_user')}
                        required
                    />
                </div>

                <div className="mb-3">
                    <RoleSelectField
                        roles={['member', 'admin', 'owner']}
                        selectedRoles={selectedRoles}
                        onRoleToggle={toggleRole}
                        label={t('roles')}
                    />
                </div>
            </Modal>
        </Container>
    );
};

export default TeamMembers;

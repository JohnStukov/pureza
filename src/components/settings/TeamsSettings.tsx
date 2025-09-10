import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { teamService } from '../../services/teamService';
import { Button, Form, Alert, Container, Row, Col } from 'react-bootstrap';
import { ActionModal, ModalConfig } from './ActionModal';
import { handleError } from '../../utils/errorHandler';
import { useOptimisticUpdate } from '../../hooks/useOptimisticUpdate';
import toast from 'react-hot-toast';
import DataTable, { Column } from '../common/DataTable';
import TeamMembers from './TeamMembers';

interface Team {
    $id: string;
    name: string;
    total: number;
}

export type TeamModalType = 'create' | 'edit' | 'delete' | 'members';

export interface ModalState {
    type: TeamModalType | null;
    team: Team | null;
}

const TeamsSettings = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [modalState, setModalState] = useState<ModalState>({ type: null, team: null });
    const [teamName, setTeamName] = useState<string>('');

    // Optimistic updates
    const { optimisticUpdate: optimisticUpdateTeam } = useOptimisticUpdate<
        Team,
        { teamId: string; name: string }
    >(
        teamService.updateTeam,
        {
            successMessage: t('team_updated_success'),
            errorMessage: t('error_updating_team')
        }
    );

    const { optimisticUpdate: optimisticDeleteTeam } = useOptimisticUpdate<
        Team,
        { teamId: string }
    >(
        teamService.deleteTeam,
        {
            successMessage: t('team_deleted_success'),
            errorMessage: t('error_deleting_team')
        }
    );

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            const teams = await teamService.listTeams();
            setTeams(teams);
        } catch (err: any) {
            toast.error(handleError(err, t));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    const openModal = (type: TeamModalType, team: Team | null = null) => {
        if (type === 'members' && team) {
            // Navigate to team members page instead of opening modal
            navigate(`/team-members/${team.$id}`, { 
                state: { teamName: team.name } 
            });
            return;
        }
        
        setModalState({ type, team });
        if (type === 'create') {
            setTeamName('');
        } else if (type === 'edit' && team) {
            setTeamName(team.name);
        }
    };

    const closeModal = () => {
        setModalState({ type: null, team: null });
        setTeamName('');
    };

    const handleCreateTeam = async () => {
        const promise = teamService.createTeam({ name: teamName });
        toast.promise(promise, {
            loading: t('creating_team'),
            success: () => {
                fetchTeams();
                closeModal();
                return t('team_created_success');
            },
            error: (err) => handleError(err, t),
        });
    };

    const handleUpdateTeam = async (teamId: string) => {
        const updatedTeam = { ...modalState.team!, name: teamName };
        
        await optimisticUpdateTeam(
            { teamId, name: teamName },
            updatedTeam,
            (data) => setTeams(current => current.map(t => (t.$id === teamId ? data : t)))
        );
        
        closeModal();
    };

    const handleDeleteTeam = async (teamId: string) => {
        const teamToDelete = teams.find(t => t.$id === teamId);
        if (!teamToDelete) return;
        
        await optimisticDeleteTeam(
            { teamId },
            teamToDelete,
            (data) => setTeams(current => current.filter(t => t.$id !== teamId))
        );
        
        closeModal();
    };

    const handleConfirmAction = (action: TeamModalType) => {
        const teamId = modalState.team?.$id;
        if (!teamId && action !== 'create') return;

        switch (action) {
            case 'create':
                handleCreateTeam();
                break;
            case 'edit':
                if (teamId) handleUpdateTeam(teamId);
                break;
            case 'delete':
                if (teamId) handleDeleteTeam(teamId);
                break;
            case 'members':
                // No action needed, modal will show TeamMembers component
                break;
        }
    };

    const { type, team } = modalState;

    // Define columns for DataTable
    const columns: Column<Team>[] = [
        {
            key: 'name',
            label: t("team_name"),
            sortable: true
        },
        {
            key: 'total',
            label: t("team_members"),
            sortable: true,
            render: (value) => value || 0
        }
    ];

    const modalConfig: { [key in TeamModalType]?: ModalConfig } = {
        create: {
            title: t("create_team"),
            body: <Form.Group><Form.Label>{t("team_name")}</Form.Label><Form.Control type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder={t("enter_team_name")} /></Form.Group>,
            confirmText: t("create"),
            confirmVariant: "primary",
            handler: () => handleConfirmAction('create'),
        },
        edit: {
            title: t("edit_team"),
            body: <Form.Group><Form.Label>{t("team_name")}</Form.Label><Form.Control type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder={t("enter_team_name")} /></Form.Group>,
            confirmText: t("save"),
            confirmVariant: "primary",
            handler: () => handleConfirmAction('edit'),
        },
        delete: {
            title: t("delete_team"),
            body: <p>{t("confirm_delete_team", { teamName: team?.name ?? '' })}</p>,
            confirmText: t("delete"),
            confirmVariant: "danger",
            handler: () => handleConfirmAction('delete'),
        },
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <h3>{t("teams_settings_title")}</h3>
                    <p>{t("teams_settings_description")}</p>

                    <DataTable
                        data={teams}
                        columns={columns}
                        loading={loading}
                        searchable={true}
                        searchPlaceholder={t("search_teams_placeholder")}
                        sortable={true}
                        pagination={true}
                        itemsPerPage={10}
                        emptyMessage={t("no_teams_found")}
                        headerActions={
                            <Button onClick={() => openModal('create')} variant="primary">
                                {t("create_team")}
                            </Button>
                        }
                        actions={(teamItem) => (
                            <>
                                <Button variant="warning" size="sm" className="me-2" onClick={() => openModal('edit', teamItem)}>
                                    {t("edit")}
                                </Button>
                                <Button variant="info" size="sm" className="me-2" onClick={() => openModal('members', teamItem)}>
                                    {t("members")}
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => openModal('delete', teamItem)}>
                                    {t("delete")}
                                </Button>
                            </>
                        )}
                    />

                    <ActionModal
                        show={!!type}
                        onClose={closeModal}
                        config={type ? modalConfig[type] || null : null}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default TeamsSettings;

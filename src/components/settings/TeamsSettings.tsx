import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { teamService } from '../../services/teamService';
import { Button, Table, Form, Alert, Container, Row, Col } from 'react-bootstrap';
import { ActionModal, ModalConfig } from './ActionModal';
import { handleError } from '../../utils/errorHandler';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface Team {
    $id: string;
    name: string;
    total: number;
}

export type TeamModalType = 'create' | 'edit' | 'delete';

export interface ModalState {
    type: TeamModalType | null;
    team: Team | null;
}

const TeamsSettings = () => {
    const { t } = useLanguage();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [modalState, setModalState] = useState<ModalState>({ type: null, team: null });
    const [teamName, setTeamName] = useState<string>('');

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        try {
            const response = await teamService.listTeams();
            if (response.success) {
                setTeams(response.data || []);
            } else {
                toast.error(response.error || t('error_loading_teams'));
            }
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
        const originalTeams = [...teams];
        const updatedTeam = { ...modalState.team!, name: teamName };

        setTeams(current => current.map(t => (t.$id === teamId ? updatedTeam : t)));
        closeModal();
        toast.success(t('team_updated_success'));

        try {
            const result = await teamService.updateTeam({ teamId, name: teamName });
            if (!result.success) {
                setTeams(originalTeams);
                toast.error(result.error || t('error_updating_team'));
            }
        } catch (err) {
            setTeams(originalTeams);
            toast.error(handleError(err, t));
        }
    };

    const handleDeleteTeam = async (teamId: string) => {
        const originalTeams = teams;
        setTeams(current => current.filter(t => t.$id !== teamId));
        closeModal();
        toast.success(t('team_deleted_success'));

        try {
            const result = await teamService.deleteTeam({ teamId });
            if (!result.success) {
                setTeams(originalTeams);
                toast.error(result.error || t('error_deleting_team'));
            }
        } catch (err) {
            setTeams(originalTeams);
            toast.error(handleError(err, t));
        }
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
        }
    };

    const { type, team } = modalState;

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

                    <Button onClick={() => openModal('create')} className="mb-3">
                        {t("create_team")}
                    </Button>

                    {loading && <LoadingSpinner text={t("loading")} centered />}

                    {!loading && teams.length === 0 && (
                        <Alert variant="info">{t("no_teams_found")}</Alert>
                    )}

                    {!loading && teams.length > 0 && (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>{t("team_name")}</th>
                                    <th>{t("team_members")}</th>
                                    <th>{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((teamItem) => (
                                    <tr key={teamItem.$id}>
                                        <td>{teamItem.name}</td>
                                        <td>{teamItem.total}</td>
                                        <td>
                                            <Button variant="warning" size="sm" className="me-2" onClick={() => openModal('edit', teamItem)}>{t("edit")}</Button>
                                            <Button variant="danger" size="sm" onClick={() => openModal('delete', teamItem)}>{t("delete")}</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}

                    <ActionModal
                        show={!!type}
                        onClose={closeModal}
                        config={type ? modalConfig[type] : null}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default TeamsSettings;

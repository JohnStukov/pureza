import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { teamService } from '../../services/teamService';
import { Button, Table, Form, Alert } from 'react-bootstrap';
import { ActionModal, ModalConfig } from './ActionModal';
import { handleError } from '../../utils/errorHandler';

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
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [modalState, setModalState] = useState<ModalState>({ type: null, team: null });
    const [teamName, setTeamName] = useState<string>('');

    const fetchTeams = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedTeams = await teamService.listTeams();
            setTeams(fetchedTeams);
        } catch (err: any) {
            setError(handleError(err, t));
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
        setError(null);
    };

    const handleConfirmAction = async (action: TeamModalType, payload?: any) => {
        setError(null);
        setMessage(null);

        try {
            switch (action) {
                case 'create':
                    await teamService.createTeam({ name: teamName });
                    setMessage(t('team_created_success'));
                    break;
                case 'edit':
                    if (!modalState.team) return;
                    await teamService.updateTeam({ teamId: modalState.team.$id, name: teamName });
                    setMessage(t('team_updated_success'));
                    break;
                case 'delete':
                    if (!modalState.team) return;
                    await teamService.deleteTeam({ teamId: modalState.team.$id });
                    setMessage(t('team_deleted_success'));
                    break;
            }
            fetchTeams();
            closeModal();
        } catch (err: any) {
            setError(handleError(err, t));
        }
    };

    const { type, team } = modalState;

    const modalConfig: { [key in TeamModalType]?: ModalConfig } = {
        create: {
            title: t("create_team"),
            body: (
                <Form.Group>
                    <Form.Label>{t("team_name")}</Form.Label>
                    <Form.Control
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder={t("enter_team_name")}
                    />
                </Form.Group>
            ),
            confirmText: t("create"),
            confirmVariant: "primary",
            handler: () => handleConfirmAction('create'),
        },
        edit: {
            title: t("edit_team"),
            body: (
                <Form.Group>
                    <Form.Label>{t("team_name")}</Form.Label>
                    <Form.Control
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder={t("enter_team_name")}
                    />
                </Form.Group>
            ),
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
        <div>
            <h2>{t("teams_settings_title")}</h2>
            <p>{t("teams_settings_description")}</p>

            <Button onClick={() => openModal('create')} className="mb-3">
                {t("create_team")}
            </Button>

            {loading && <p>{t("loading")}</p>}
            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}

            {!loading && !error && teams.length === 0 && (
                <Alert variant="info">{t("no_teams_found")}</Alert>
            )}

            {!loading && !error && teams.length > 0 && (
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
                                    <Button variant="warning" size="sm" className="me-2" onClick={() => openModal('edit', teamItem)}>
                                        {t("edit")}
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => openModal('delete', teamItem)}>
                                        {t("delete")}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <ActionModal
                show={!!type}
                onClose={closeModal}
                config={type ? modalConfig[type] || null : null}
            />
        </div>
    );
};

export default TeamsSettings;
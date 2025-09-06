import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { functions } from '../../utils/appwrite';
import { Container, Row, Col, Button, Table, Form, Alert, Badge, Pagination } from 'react-bootstrap';
import { Models } from 'appwrite';
import { ActionModal, ModalConfig } from './ActionModal';
import { handleError } from '../../utils/errorHandler';

interface UserFormState {
    email: string;
    password?: string;
    name?: string;
}

export type UserModalType = 'create' | 'update' | 'delete' | 'updateStatus' | 'createPasswordRecovery' | 'updateVerification';

export interface ModalState {
    type: UserModalType | null;
    user: Models.User<Models.Preferences> | null;
}

const UsersSettings = () => {
    const { t } = useLanguage();
    const [usersList, setUsersList] = useState<Models.User<Models.Preferences>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    const [modalState, setModalState] = useState<ModalState>({ type: null, user: null });
    const [formState, setFormState] = useState<UserFormState>({ email: '', password: '', name: '' });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await functions.createExecution(
                process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID!,
                JSON.stringify({ action: 'list' }),
                false
            );
            const result = JSON.parse(response.responseBody);
            if (result.error) throw new Error(result.error);
            setUsersList(Array.isArray(result.users) ? result.users : []);
        } catch (err: any) {
            setError(handleError(err, t));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.id]: e.target.value });
    };

    const openModal = (type: UserModalType, user: Models.User<Models.Preferences> | null = null) => {
        setModalState({ type, user });
        if (type === 'create') {
            setFormState({ email: '', password: '', name: '' });
        } else if (type === 'update' && user) {
            setFormState({ email: user.email, name: user.name || '' });
        }
    };

    const closeModal = () => {
        setModalState({ type: null, user: null });
        setFormState({ email: '', password: '', name: '' });
    };

    const handleConfirmAction = async (action: UserModalType, payload?: any) => {
        const actionMap: { [key in UserModalType]: { success: string; error: string } } = {
            create: { success: t("user_created_success"), error: t("error_creating_user") },
            update: { success: t("user_updated_success"), error: t("error_updating_user") },
            delete: { success: t("user_deleted_success"), error: t("error_deleting_user") },
            updateStatus: { success: t("user_status_updated"), error: t("error_updating_status") },
            createPasswordRecovery: { success: t("recovery_sent"), error: t("error_sending_recovery") },
            updateVerification: { success: t("user_verified"), error: t("error_verifying_user") },
        };

        setError(null);
        setMessage(null);

        try {
            const response = await functions.createExecution(
                process.env.REACT_APP_APPWRITE_MANAGE_USERS_FUNCTION_ID!,
                JSON.stringify({ ...payload, action }),
                false
            );
            const result = JSON.parse(response.responseBody);
            if (result.error) throw new Error(result.error);
            
            setMessage(actionMap[action].success);
            fetchUsers();
            closeModal();
        } catch (err: any) {
            setError(handleError(err, t));
        }
    };

    const filteredUsers = usersList.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const { type, user } = modalState;

    const modalConfig: { [key in UserModalType]?: ModalConfig } = {
        create: {
            title: t("create_user"),
            body: (
                <Form>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>{t("email")}</Form.Label>
                        <Form.Control type="email" value={formState.email} onChange={handleFormChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>{t("password")}</Form.Label>
                        <Form.Control type="password" value={formState.password} onChange={handleFormChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>{t("name")}</Form.Label>
                        <Form.Control type="text" value={formState.name} onChange={handleFormChange} />
                    </Form.Group>
                </Form>
            ),
            confirmText: t("save"),
            confirmVariant: "primary",
            handler: () => handleConfirmAction('create', { data: formState }),
        },
                update: {
            title: t("edit_user"),
            body: (
                <Form>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>{t("email")}</Form.Label>
                        <Form.Control type="email" value={formState.email} required disabled />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>{t("name")}</Form.Label>
                        <Form.Control type="text" value={formState.name} onChange={handleFormChange} />
                    </Form.Group>
                </Form>
            ),
            confirmText: t("save"),
            confirmVariant: "primary",
            handler: () => handleConfirmAction('update', { userId: user?.$id, data: { name: formState.name } }),
        },
        delete: {
            title: t("delete_user"),
            body: <p>{t("confirm_delete")} <strong>{user?.email}</strong></p>,
            confirmText: t("delete_user"),
            confirmVariant: "danger",
            handler: () => handleConfirmAction('delete', { userId: user?.$id }),
        },
                updateStatus: {
            title: user?.status ? t("disable_user") : t("enable_user"),
            body: <p>{user?.status ? t("confirm_disable") : t("confirm_enable")} <strong>{user?.email}</strong></p>,
            confirmText: user?.status ? t("disable_user") : t("enable_user"),
            confirmVariant: user?.status ? "danger" : "success",
            handler: () => handleConfirmAction('updateStatus', { userId: user?.$id, data: { status: !user?.status } }),
        },
        createPasswordRecovery: {
            title: t("send_recovery"),
            body: <p>{t("confirm_recovery")} <strong>{user?.email}</strong></p>,
            confirmText: t("send_recovery"),
            confirmVariant: "primary",
            handler: () => handleConfirmAction('createPasswordRecovery', { userId: user?.$id }),
        },
        updateVerification: {
            title: t("mark_verified"),
            body: <p>{t("confirm_verification")} <strong>{user?.email}</strong></p>,
            confirmText: t("mark_verified"),
            confirmVariant: "primary",
            handler: () => handleConfirmAction('updateVerification', { userId: user?.$id }),
        },
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <h3>{t("user_list")}</h3>
                    <Row className="mb-3">
                        <Col>
                            <Form.Control
                                type="text"
                                placeholder={t("search_users_placeholder")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Col>
                        <Col xs="auto">
                            <Button variant="primary" onClick={() => openModal('create')}>
                                {t("create_user")}
                            </Button>
                        </Col>
                    </Row>

                    {loading && <p>Cargando usuarios...</p>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {message && <Alert variant="success">{message}</Alert>}

                    {!loading && filteredUsers.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>{t("name")}</th>
                                    <th>{t("email")}</th>
                                    <th>{t("status")}</th>
                                    <th>{t("verified")}</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map((user) => (
                                    <tr key={user.$id}>
                                        <td>{user.$id}</td>
                                        <td>{user.name || 'N/A'}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <Badge bg={user.status ? "success" : "danger"}>
                                                {user.status ? t("enabled") : t("disabled")}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={user.emailVerification ? "success" : "warning"}>
                                                {user.emailVerification ? t("verified") : t("not_verified")}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Button variant="info" size="sm" className="me-2" onClick={() => openModal('update', user)}>{t("edit_user")}</Button>
                                            <Button variant="danger" size="sm" className="me-2" onClick={() => openModal('delete', user)}>{t("delete_user")}</Button>
                                            <Button variant={user.status ? "warning" : "success"} size="sm" className="me-2" onClick={() => openModal('updateStatus', user)}>
                                                {user.status ? t("disable_user") : t("enable_user")}
                                            </Button>
                                            <Button variant="secondary" size="sm" className="me-2" onClick={() => openModal('createPasswordRecovery', user)}>{t("send_recovery")}</Button>
                                            {!user.emailVerification && (
                                                <Button variant="primary" size="sm" onClick={() => openModal('updateVerification', user)}>{t("mark_verified")}</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        !loading && <p>No hay usuarios registrados.</p>
                    )}

                    <Pagination className="justify-content-center mt-3">
                        {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => i + 1).map(number => (
                            <Pagination.Item key={number} active={number === currentPage} onClick={() => paginate(number)}>
                                {number}
                            </Pagination.Item>
                        ))}
                    </Pagination>

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

export default UsersSettings;
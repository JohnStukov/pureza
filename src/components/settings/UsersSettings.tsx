import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Container, Row, Col, Button, Table, Form, Alert, Badge } from 'react-bootstrap';
import { ActionModal, ModalConfig } from './ActionModal';
import { handleError } from '../../utils/errorHandler';
import { userManagementService, AppwriteUser } from '../../services/userManagementService';
import LoadingSpinner from '../common/LoadingSpinner';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { useModal } from '../../hooks/useModal';
import { useOptimisticUpdate } from '../../hooks/useOptimisticUpdate';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';

interface UserFormState {
    email: string;
    password?: string;
    name?: string;
}

export type UserModalType = 'create' | 'update' | 'delete' | 'updateStatus' | 'createPasswordRecovery' | 'updateVerification';

export interface ModalState {
    type: UserModalType | null;
    user: AppwriteUser | null;
}

const UsersSettings = () => {
    const { t } = useLanguage();
    const [usersList, setUsersList] = useState<AppwriteUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'status' | 'createdAt'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { modalState, openModal, closeModal } = useModal<AppwriteUser>({
        onOpen: (type, user) => {
            if (type === 'create') {
                setFormState({ email: '', name: '' });
                setPassword('');
            } else if (type === 'update' && user) {
                setFormState({ email: user.email, name: user.name || '' });
                setPassword('');
            }
        },
        onClose: () => {
            setFormState({ email: '', name: '' });
            setPassword('');
        }
    });
    
    const [formState, setFormState] = useState<UserFormState>({ email: '', name: '' });
    const [password, setPassword] = useState('');

    // Optimistic updates
    const { optimisticUpdate: optimisticDeleteUser } = useOptimisticUpdate<
        AppwriteUser,
        string
    >(
        (userId: string) => userManagementService.deleteUser(userId),
        {
            successMessage: t("user_deleted_success"),
            errorMessage: t("error_deleting_user")
        }
    );

    const { optimisticUpdate: optimisticUpdateUserStatus } = useOptimisticUpdate<
        AppwriteUser,
        { userId: string; status: boolean }
    >(
        ({ userId, status }) => userManagementService.updateUserStatus(userId, status),
        {
            successMessage: t("user_status_updated"),
            errorMessage: t("error_updating_status")
        }
    );

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const result = await userManagementService.listUsers();
            if (!result.success) {
                toast.error(result.error || t("error_loading_users"));
            }
            setUsersList(Array.isArray(result.data) ? result.data : []);
        } catch (err: any) {
            toast.error(handleError(err, t));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.id === 'password') {
            setPassword(e.target.value);
        } else {
            setFormState({ ...formState, [e.target.id]: e.target.value });
        }
    };

    const handleOpenModal = (type: UserModalType, user?: AppwriteUser) => {
        openModal(type, user);
    };

    const handleDeleteUser = async (userId: string) => {
        const userToDelete = usersList.find(u => u.$id === userId);
        if (!userToDelete) return;

        await optimisticDeleteUser(
            userId,
            userToDelete,
            (data) => setUsersList(currentUsers => currentUsers.filter(u => u.$id !== userId))
        );
        
        closeModal();
    };

    const handleUpdateUserStatus = async (userId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        const userToUpdate = usersList.find(u => u.$id === userId);
        if (!userToUpdate) return;

        const updatedUser = { ...userToUpdate, status: newStatus };

        await optimisticUpdateUserStatus(
            { userId, status: newStatus },
            updatedUser,
            (data) => setUsersList(currentUsers =>
                currentUsers.map(u => (u.$id === userId ? data : u))
            )
        );
        
        closeModal();
    };

    const handleConfirmAction = async (action: UserModalType, payload?: any) => {
        if (action === 'delete') {
            if (payload.userId) handleDeleteUser(payload.userId);
            return;
        }

        if (action === 'updateStatus') {
            if (payload.userId !== undefined && payload.currentStatus !== undefined) {
                handleUpdateUserStatus(payload.userId, payload.currentStatus);
            }
            return;
        }

        const actionMap: { [key in UserModalType]: { success: string; error: string } } = {
            create: { success: t("user_created_success"), error: t("error_creating_user") },
            update: { success: t("user_updated_success"), error: t("error_updating_user") },
            delete: { success: t("user_deleted_success"), error: t("error_deleting_user") },
            updateStatus: { success: t("user_status_updated"), error: t("error_updating_status") },
            createPasswordRecovery: { success: t("recovery_sent"), error: t("error_sending_recovery") },
            updateVerification: { success: t("user_verified"), error: t("error_verifying_user") },
        };

        try {
            let result;
            switch (action) {
                case 'create':
                    result = await userManagementService.createUser(payload.data);
                    break;
                case 'update':
                    result = await userManagementService.updateUser(payload.userId, payload.data);
                    break;
                case 'createPasswordRecovery':
                    result = await userManagementService.createPasswordRecovery(payload.userId);
                    break;
                case 'updateVerification':
                    result = await userManagementService.updateVerification(payload.userId);
                    break;
            }

            if (result && result.success) {
                toast.success(actionMap[action].success);
                fetchUsers(); // Refresh list for create/update actions
                closeModal();
            } else if (result) {
                toast.error(result.error || actionMap[action].error);
            }
        } catch (err: any) {
            toast.error(handleError(err, t));
        }
    };

    // Filter and sort users
    const filteredAndSortedUsers = useMemo(() => {
        let filtered = usersList;

        // Filter by search term
        if (debouncedSearchTerm) {
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        // Sort users
        filtered.sort((a, b) => {
            let aValue: any = a[sortBy as keyof typeof a];
            let bValue: any = b[sortBy as keyof typeof b];

            if (sortBy === 'createdAt') {
                aValue = new Date(a.$createdAt).getTime();
                bValue = new Date(b.$createdAt).getTime();
            } else if (sortBy === 'status') {
                aValue = a.status ? 1 : 0;
                bValue = b.status ? 1 : 0;
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [usersList, debouncedSearchTerm, sortBy, sortOrder]);

    // Pagination
    const {
        currentPage,
        totalPages,
        itemsPerPage,
        paginatedItems: currentUsers,
        goToPage,
        setItemsPerPage,
        paginationInfo
    } = usePagination(filteredAndSortedUsers, {
        totalItems: filteredAndSortedUsers.length,
        itemsPerPage: 10
    });

    const { type, data: user } = modalState;

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
                        <Form.Control type="password" value={password} onChange={handleFormChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>{t("name")}</Form.Label>
                        <Form.Control type="text" value={formState.name} onChange={handleFormChange} />
                    </Form.Group>
                </Form>
            ),
            confirmText: t("save"),
            confirmVariant: "primary",
            handler: () => handleConfirmAction('create', { data: { ...formState, password } }),
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
            handler: () => handleConfirmAction('updateStatus', { userId: user?.$id, currentStatus: user?.status }),
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
                        <Col md={4}>
                            <Form.Control
                                type="text"
                                placeholder={t("search_users_placeholder")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                            >
                                <option value="name">{t("sort_by_name")}</option>
                                <option value="email">{t("sort_by_email")}</option>
                                <option value="status">{t("sort_by_status")}</option>
                                <option value="createdAt">{t("sort_by_date")}</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as any)}
                            >
                                <option value="asc">{t("ascending")}</option>
                                <option value="desc">{t("descending")}</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            >
                                <option value={5}>5 {t("per_page")}</option>
                                <option value={10}>10 {t("per_page")}</option>
                                <option value={25}>25 {t("per_page")}</option>
                                <option value={50}>50 {t("per_page")}</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button variant="primary" onClick={() => handleOpenModal('create')} className="w-100">
                                {t("create_user")}
                            </Button>
                        </Col>
                    </Row>

                    {loading && <LoadingSpinner text="Cargando usuarios..." centered />}

                    {!loading && filteredAndSortedUsers.length > 0 ? (
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
                                            <Button variant="info" size="sm" className="me-2" onClick={() => handleOpenModal('update', user)}>{t("edit_user")}</Button>
                                            <Button variant="danger" size="sm" className="me-2" onClick={() => handleOpenModal('delete', user)}>{t("delete_user")}</Button>
                                            <Button variant={user.status ? "warning" : "success"} size="sm" className="me-2" onClick={() => handleOpenModal('updateStatus', user)}>
                                                {user.status ? t("disable_user") : t("enable_user")}
                                            </Button>
                                            <Button variant="secondary" size="sm" className="me-2" onClick={() => handleOpenModal('createPasswordRecovery', user)}>{t("send_recovery")}</Button>
                                            {!user.emailVerification && (
                                                <Button variant="primary" size="sm" onClick={() => handleOpenModal('updateVerification', user)}>{t("mark_verified")}</Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        !loading && (
                            <Alert variant="info">
                                {searchTerm ? t("no_users_found_search") : t("no_users_found")}
                            </Alert>
                        )
                    )}

                    {/* Results info */}
                    <Row className="mb-2">
                        <Col>
                            <small style={{ color: 'var(--text-muted)' }}>
                                {t("showing_results", {
                                    start: paginationInfo.startIndex,
                                    end: paginationInfo.endIndex,
                                    total: filteredAndSortedUsers.length
                                })}
                            </small>
                        </Col>
                    </Row>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                            className="mt-3"
                        />
                    )}

                    <ActionModal
                        show={modalState.isOpen}
                        onClose={closeModal}
                        config={type ? modalConfig[type as UserModalType] || null : null}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default UsersSettings;
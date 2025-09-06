import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UsersSettings from './UsersSettings';
import { LanguageProvider } from '../../context/LanguageContext';
import { functions } from '../../utils/appwrite';

// Mock de la función de Appwrite
jest.mock('../../utils/appwrite', () => ({
    functions: {
        createExecution: jest.fn(),
    },
}));

const mockUsers = {
    users: [
        { $id: '1', name: 'User One', email: 'user1@example.com', status: true, emailVerification: true },
        { $id: '2', name: 'User Two', email: 'user2@example.com', status: false, emailVerification: false },
    ],
    total: 2,
};

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <LanguageProvider>
                <UsersSettings />
            </LanguageProvider>
        </MemoryRouter>
    );
};

describe('UsersSettings Component', () => {
    beforeEach(() => {
        // Limpiamos los mocks antes de cada prueba
        (functions.createExecution as jest.Mock).mockClear();
    });

    test('should show loading state initially and then render users', async () => {
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify(mockUsers),
        });

        renderComponent();

        // Verifica el estado de carga
        expect(screen.getByText(/Cargando usuarios.../i)).toBeInTheDocument();

        // Espera a que aparezcan los usuarios
        await waitFor(() => {
            expect(screen.getByText('User One')).toBeInTheDocument();
            expect(screen.getByText('user2@example.com')).toBeInTheDocument();
        });

        // Verifica que la llamada a la función se hizo con la acción correcta
        expect(functions.createExecution).toHaveBeenCalledWith(
            expect.any(String),
            JSON.stringify({ action: 'list' }),
            false
        );
    });

    test('should show an error message if fetching users fails', async () => {
        const errorMessage = 'Failed to fetch';
        (functions.createExecution as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/Error al obtener usuarios/i)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(errorMessage, "i"))).toBeInTheDocument();
        });
    });

    test('should open the create user modal', async () => {
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify(mockUsers),
        });

        renderComponent();
        await waitFor(() => expect(screen.getByText('User One')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /Crear Usuario/i }));

        // El modal de creación debe estar visible
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText(/Crear Usuario/i)).toBeInTheDocument();
    });

    test('should open the disable user modal and call the updateStatus action', async () => {
        (functions.createExecution as jest.Mock).mockResolvedValue({
            responseBody: JSON.stringify(mockUsers),
        });

        renderComponent();
        await waitFor(() => expect(screen.getByText('User One')).toBeInTheDocument());

        // Busca el botón para deshabilitar al primer usuario
        const disableButtons = screen.getAllByRole('button', { name: /Deshabilitar Usuario/i });
        fireEvent.click(disableButtons[0]);

        // Verifica que el modal de confirmación se abre
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText(/¿Estás seguro de que quieres deshabilitar a este usuario\?/i)).toBeInTheDocument();

        // Simula el clic en el botón de confirmación del modal
        const confirmButton = within(dialog).getByRole('button', { name: /Deshabilitar Usuario/i });
        fireEvent.click(confirmButton);

        // Espera a que la función sea llamada
        await waitFor(() => {
            const calls = (functions.createExecution as jest.Mock).mock.calls;
            const updateCall = calls.find(call => {
                try {
                    const payload = JSON.parse(call[1]);
                    return payload.action === 'updateStatus' && payload.userId === '1' && payload.data.status === false;
                } catch (e) {
                    return false;
                }
            });
            expect(updateCall).toBeDefined();
        });
    });

    test('should create a new user', async () => {
        // Mock initial user list fetch
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify(mockUsers),
        });
        // Mock successful user creation
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify({ success: true, user: { $id: '3', name: 'New User', email: 'new@example.com', status: true, emailVerification: false } }),
        });
        // Mock user list fetch after creation
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify({
                users: [...mockUsers.users, { $id: '3', name: 'New User', email: 'new@example.com', status: true, emailVerification: false }],
                total: 3,
            }),
        });

        renderComponent();
        await waitFor(() => expect(screen.getByText('User One')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /Crear Usuario/i }));

        const dialog = screen.getByRole('dialog');
        fireEvent.change(within(dialog).getByLabelText(/Correo Electrónico/i), { target: { value: 'new@example.com' } });
        fireEvent.change(within(dialog).getByLabelText(/Contraseña/i), { target: { value: 'password123' } });
        fireEvent.change(within(dialog).getByLabelText(/Nombre/i), { target: { value: 'New User' } });

        fireEvent.click(within(dialog).getByRole('button', { name: /Guardar/i }));

        await waitFor(() => {
            const calls = (functions.createExecution as jest.Mock).mock.calls;
            const createCall = calls.find(call => {
                try {
                    const payload = JSON.parse(call[1]);
                    return payload.action === 'create' &&
                           payload.data.email === 'new@example.com' &&
                           payload.data.password === 'password123' &&
                           payload.data.name === 'New User';
                } catch (e) {
                    return false;
                }
            });
            expect(createCall).toBeDefined();
            expect(screen.getByText('New User')).toBeInTheDocument(); // Verify new user is rendered
        });
    });

    test('should edit an existing user', async () => {
        // Mock initial user list fetch
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify(mockUsers),
        });
        // Mock successful user update
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify({ success: true, user: { ...mockUsers.users[0], name: 'Updated User One' } }),
        });
        // Mock user list fetch after update
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify({
                users: [{ ...mockUsers.users[0], name: 'Updated User One' }, mockUsers.users[1]],
                total: 2,
            }),
        });

        renderComponent();
        await waitFor(() => expect(screen.getByText('User One')).toBeInTheDocument());

        fireEvent.click(screen.getAllByRole('button', { name: /Editar Usuario/i })[0]); // Click first edit button

        const dialog = screen.getByRole('dialog');
        fireEvent.change(within(dialog).getByLabelText(/Nombre/i), { target: { value: 'Updated User One' } });

        fireEvent.click(within(dialog).getByRole('button', { name: /Guardar/i }));

        await waitFor(() => {
            const calls = (functions.createExecution as jest.Mock).mock.calls;
            const updateCall = calls.find(call => {
                try {
                    const payload = JSON.parse(call[1]);
                    return payload.action === 'update' &&
                           payload.userId === '1' &&
                           payload.data.name === 'Updated User One';
                } catch (e) {
                    return false;
                }
            });
            expect(updateCall).toBeDefined();
            expect(screen.getByText('Updated User One')).toBeInTheDocument(); // Verify updated user is rendered
        });
    });

    test('should delete a user', async () => {
        // Mock initial user list fetch
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify(mockUsers),
        });
        // Mock successful user deletion
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify({ success: true }),
        });
        // Mock user list fetch after deletion
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify({
                users: [mockUsers.users[1]], // User One is deleted
                total: 1,
            }),
        });

        renderComponent();
        await waitFor(() => expect(screen.getByText('User One')).toBeInTheDocument());

        fireEvent.click(screen.getAllByRole('button', { name: /Eliminar Usuario/i })[0]); // Click first delete button

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText(/¿Estás seguro de que quieres eliminar este usuario\?/i)).toBeInTheDocument();

        fireEvent.click(within(dialog).getByRole('button', { name: /Eliminar Usuario/i })); // Click confirm delete button

        await waitFor(() => {
            const calls = (functions.createExecution as jest.Mock).mock.calls;
            const deleteCall = calls.find(call => {
                try {
                    const payload = JSON.parse(call[1]);
                    return payload.action === 'delete' && payload.userId === '1';
                } catch (e) {
                    return false;
                }
            });
            expect(deleteCall).toBeDefined();
            expect(screen.queryByText('User One')).not.toBeInTheDocument(); // Verify user is removed from document
        });
    });

    test('should send a recovery email', async () => {
        // Mock initial user list fetch
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify(mockUsers),
        });
        // Mock successful recovery email send
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify({ success: true }),
        });
        // Mock user list fetch after action (no change expected in list)
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify(mockUsers),
        });

        renderComponent();
        await waitFor(() => expect(screen.getByText('User One')).toBeInTheDocument());

        fireEvent.click(screen.getAllByRole('button', { name: /Enviar Recuperación/i })[0]); // Click first send recovery button

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText(/¿Estás seguro de que quieres enviar un correo de recuperación de contraseña a este usuario\?/i)).toBeInTheDocument();

        fireEvent.click(within(dialog).getByRole('button', { name: /Enviar Recuperación/i })); // Click confirm send recovery button

        await waitFor(() => {
            const calls = (functions.createExecution as jest.Mock).mock.calls;
            const recoveryCall = calls.find(call => {
                try {
                    const payload = JSON.parse(call[1]);
                    return payload.action === 'createPasswordRecovery' && payload.userId === '1';
                } catch (e) {
                    return false;
                }
            });
            expect(recoveryCall).toBeDefined();
            expect(screen.getByText(/Correo de recuperación enviado exitosamente./i)).toBeInTheDocument(); // Verify success message
        });
    });

    test('should mark a user as verified', async () => {
        // Mock initial user list fetch
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify(mockUsers),
        });
        // Mock successful user verification
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify({ success: true }),
        });
        // Mock user list fetch after verification
        (functions.createExecution as jest.Mock).mockResolvedValueOnce({
            responseBody: JSON.stringify({
                users: [{ ...mockUsers.users[1], emailVerification: true }, mockUsers.users[0]], // User Two is verified
                total: 2,
            }),
        });

        renderComponent();
        await waitFor(() => expect(screen.getByText('User Two')).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /Marcar como Verificado/i })); // Click mark as verified button for User Two

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText(/¿Estás seguro de que quieres marcar a este usuario como verificado\?/i)).toBeInTheDocument();

        fireEvent.click(within(dialog).getByRole('button', { name: /Marcar como Verificado/i })); // Click confirm mark as verified button

        await waitFor(() => {
            const calls = (functions.createExecution as jest.Mock).mock.calls;
            const verifyCall = calls.find(call => {
                try {
                    const payload = JSON.parse(call[1]);
                    return payload.action === 'updateVerification' && payload.userId === '2';
                } catch (e) {
                    return false;
                }
            });
            expect(verifyCall).toBeDefined();
            const userTwoRow = screen.getByText('User Two').closest('tr');
            if (!userTwoRow) {
                throw new Error('Could not find table row for User Two');
            }
            expect(within(userTwoRow).getByText('Verificado')).toBeInTheDocument(); // Verify status is updated
        });
    });

});
import React from 'react';
import { Navbar, Container, Button, Nav } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const AppNavbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login'); // Redirect to login page after logout
        } catch (error) {
            console.error('Failed to logout', error);
            // Optionally, show an error message to the user
        }
    };

    
    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand href="#home">{t("pureza_app")}</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/dashboard">{t("dashboard_title")}</Nav.Link>
                        <Nav.Link as={Link} to="/settings">{t("settings_title")}</Nav.Link>
                    </Nav>
                    <Button variant="outline-danger" onClick={handleLogout}>
                        {t("logout")}
                    </Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;

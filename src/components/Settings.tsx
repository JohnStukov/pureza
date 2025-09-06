import React from 'react';
import { Container, Row, Col, Nav, Card } from 'react-bootstrap';
import { Link, Outlet } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
    const { t } = useLanguage();

    return (
        <Container fluid className="mt-3">
            <Row>
                {/* Sidebar */}
                <Col xs={12} md={3} lg={2} className="mb-3">
                    <Card>
                        <Card.Body>
                            <Nav className="flex-column">
                                <Nav.Link as={Link} to="/settings/users">
                                    {t("users_settings")}
                                </Nav.Link>
                                <Nav.Link as={Link} to="/settings/teams">
                                    {t("teams_settings")}
                                </Nav.Link>
                                <Nav.Link as={Link} to="/settings/language">
                                    {t("language_settings")}
                                </Nav.Link>
                                <Nav.Link as={Link} to="/settings/theme">
                                    {t("theme_settings")}
                                </Nav.Link>
                                <Nav.Link as={Link} to="/settings/products">
                                    {t("product_management")}
                                </Nav.Link>
                                {/* Add more settings options here */}
                            </Nav>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Main Content */}
                <Col xs={12} md={9} lg={10}>
                    <Card>
                        <Card.Body>
                            <Outlet /> {/* Renders nested routes */}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Settings;

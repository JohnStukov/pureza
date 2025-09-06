import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const ThemeSettings = () => {
    const { t } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    return (
        <Container fluid>
            <Row>
                <Col>
                    <h3>{t("theme_settings")}</h3>
                    <Card>
                        <Card.Body>
                            <p>{t("current_theme")}: {theme === 'light' ? t("light_theme") : t("dark_theme")}</p>
                            <Button variant="secondary" onClick={toggleTheme}>
                                {t("toggle_theme")}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ThemeSettings;

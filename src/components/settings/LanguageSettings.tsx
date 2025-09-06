import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSettings = () => {
    const { t, changeLanguage, language } = useLanguage();

    return (
        <Container fluid>
            <Row>
                <Col>
                    <h3>{t("language_settings")}</h3>
                    <Card>
                        <Card.Body>
                            <p>{t("current_language")}: <strong>{language.toUpperCase()}</strong></p>
                            <div className="d-flex gap-2">
                                <Button 
                                    variant={language === 'es' ? 'primary' : 'secondary'} 
                                    onClick={() => changeLanguage('es')}
                                >
                                    Español
                                </Button>
                                <Button 
                                    variant={language === 'en' ? 'primary' : 'secondary'} 
                                    onClick={() => changeLanguage('en')}
                                >
                                    English
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LanguageSettings;

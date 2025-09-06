import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
    const { t } = useLanguage();

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <Row className="justify-content-center w-100">
                <Col xs={12} md={8} lg={6}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">{t("dashboard_title")}</h2>
                            <p className="text-center">{t("dashboard_welcome")}</p>
                            
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};


export default Dashboard;

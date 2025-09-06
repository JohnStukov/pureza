import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { databases } from '../utils/appwrite'; // Import databases service
import { ID } from 'appwrite';
import { useLanguage } from '../context/LanguageContext';
import { handleError } from '../utils/errorHandler';

const ProductForm = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            await databases.createDocument(
                process.env.REACT_APP_APPWRITE_DATABASE_ID!,
                process.env.REACT_APP_APPWRITE_PRODUCTS_COLLECTION_ID!,
                ID.unique(), // Document ID
                {
                    name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                }
            );
            setMessage(t('product_saved_success'));
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
        } catch (err: any) {
            setError(handleError(err, t));
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <Row className="justify-content-center w-100">
                <Col xs={12} md={8} lg={6}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">{t("add_new_product")}</h2>
                            {message && <Alert variant="success">{message}</Alert>}
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="productName">
                                    <Form.Label>{t("product_name")}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="productDescription">
                                    <Form.Label>{t("product_description")}</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="productPrice">
                                    <Form.Label>{t("product_price")}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="productStock">
                                    <Form.Label>{t("product_stock")}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Button className="w-100 mt-3" type="submit">
                                    {t("save_product")}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductForm;

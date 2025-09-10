import React from 'react';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { databases } from '../utils/appwrite'; // Import databases service
import { ID } from 'appwrite';
import { useLanguage } from '../context/LanguageContext';
import { handleError } from '../utils/errorHandler';
import { useFormField } from '../hooks/useFormField';
import { validationRules } from '../utils/validation';
import FormField from './common/FormField';
import LoadingSpinner from './common/LoadingSpinner';

const ProductForm = () => {
    const { t } = useLanguage();

    const { 
        isSubmitting, 
        submitError, 
        handleSubmit, 
        createFieldProps,
        resetForm 
    } = useFormField({
        initialValues: { name: '', description: '', price: '', stock: '' },
        validationRules: {
            name: validationRules.name,
            description: { required: false },
            price: { required: true, min: 0 },
            stock: { required: true, min: 0 }
        },
        onSubmit: async (values) => {
            try {
                await databases.createDocument(
                    process.env.REACT_APP_APPWRITE_DATABASE_ID!,
                    process.env.REACT_APP_APPWRITE_PRODUCTS_COLLECTION_ID!,
                    ID.unique(),
                    {
                        name: values.name,
                        description: values.description,
                        price: parseFloat(values.price),
                        stock: parseInt(values.stock),
                    }
                );
                resetForm();
                // Show success message (you might want to use toast here)
            } catch (err: any) {
                throw new Error(handleError(err, t));
            }
        }
    });

    const nameProps = createFieldProps('name');
    const descriptionProps = createFieldProps('description');
    const priceProps = createFieldProps('price');
    const stockProps = createFieldProps('stock');

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
            <Row className="justify-content-center w-100">
                <Col xs={12} md={8} lg={6}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">{t("add_new_product")}</h2>
                            {submitError && <Alert variant="danger">{submitError}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <FormField
                                    label={t("product_name")}
                                    type="text"
                                    required
                                    {...nameProps}
                                />

                                <FormField
                                    label={t("product_description")}
                                    type="textarea"
                                    rows={3}
                                    {...descriptionProps}
                                />

                                <FormField
                                    label={t("product_price")}
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    required
                                    {...priceProps}
                                />

                                <FormField
                                    label={t("product_stock")}
                                    type="number"
                                    min={0}
                                    required
                                    {...stockProps}
                                />

                                <Button 
                                    className="w-100 mt-3" 
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <LoadingSpinner size="sm" text={t("saving")} />
                                    ) : (
                                        t("save_product")
                                    )}
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

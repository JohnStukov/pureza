import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Alert, Row, Col, Table } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { productService, Product, ProductCreatePayload, ProductUpdatePayload } from '../../services/productService';
import { ActionModal, ModalConfig } from './ActionModal';
import { handleError } from '../../utils/errorHandler';

export type ProductModalType = 'create' | 'edit' | 'delete';

export interface ModalState {
    type: ProductModalType | null;
    product: Product | null;
}

const ProductManagement = () => {
    const { t } = useLanguage();
    const [productsList, setProductsList] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const [modalState, setModalState] = useState<ModalState>({ type: null, product: null });
    const [formState, setFormState] = useState<ProductCreatePayload | ProductUpdatePayload>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
    });

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedProducts = await productService.listProducts();
            setProductsList(fetchedProducts);
        } catch (err: any) {
            setError(handleError(err, t));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [id]: id === 'price' || id === 'stock' ? parseFloat(value) : value,
        }));
    };

    const openModal = (type: ProductModalType, product: Product | null = null) => {
        setModalState({ type, product });
        if (type === 'create') {
            setFormState({ name: '', description: '', price: 0, stock: 0 });
        } else if (type === 'edit' && product) {
            setFormState({ name: product.name, description: product.description, price: product.price, stock: product.stock });
        }
    };

    const closeModal = () => {
        setModalState({ type: null, product: null });
        setFormState({ name: '', description: '', price: 0, stock: 0 });
    };

    const handleConfirmAction = async (action: ProductModalType) => {
        setError(null);
        setMessage(null);

        try {
            switch (action) {
                case 'create':
                    await productService.createProduct(formState as ProductCreatePayload);
                    setMessage(t('product_saved_success'));
                    break;
                case 'edit':
                    if (!modalState.product) return;
                    await productService.updateProduct({ productId: modalState.product.$id, ...formState } as ProductUpdatePayload);
                    setMessage(t('product_updated_success'));
                    break;
                case 'delete':
                    if (!modalState.product) return;
                    await productService.deleteProduct(modalState.product.$id);
                    setMessage(t('product_deleted_success'));
                    break;
            }
            fetchProducts();
            closeModal();
        } catch (err: any) {
            setError(handleError(err, t));
        }
    };

    const { type, product } = modalState;

    const modalConfig: { [key in ProductModalType]?: ModalConfig } = {
        create: {
            title: t("add_new_product"),
            body: (
                <Form>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>{t("product_name")}</Form.Label>
                        <Form.Control type="text" value={formState.name} onChange={handleFormChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>{t("product_description")}</Form.Label>
                        <Form.Control as="textarea" rows={3} value={formState.description} onChange={handleFormChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="price">
                        <Form.Label>{t("product_price")}</Form.Label>
                        <Form.Control type="number" step="0.01" value={formState.price} onChange={handleFormChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="stock">
                        <Form.Label>{t("product_stock")}</Form.Label>
                        <Form.Control type="number" value={formState.stock} onChange={handleFormChange} required />
                    </Form.Group>
                </Form>
            ),
            confirmText: t("save"),
            confirmVariant: "primary",
            handler: () => handleConfirmAction('create'),
        },
        edit: {
            title: t("edit_product"),
            body: (
                <Form>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>{t("product_name")}</Form.Label>
                        <Form.Control type="text" value={formState.name} onChange={handleFormChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>{t("product_description")}</Form.Label>
                        <Form.Control as="textarea" rows={3} value={formState.description} onChange={handleFormChange} />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="price">
                        <Form.Label>{t("product_price")}</Form.Label>
                        <Form.Control type="number" step="0.01" value={formState.price} onChange={handleFormChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="stock">
                        <Form.Label>{t("product_stock")}</Form.Label>
                        <Form.Control type="number" value={formState.stock} onChange={handleFormChange} required />
                    </Form.Group>
                </Form>
            ),
            confirmText: t("save"),
            confirmVariant: "primary",
            handler: () => handleConfirmAction('edit'),
        },
        delete: {
            title: t("delete_product"),
            body: <p>{t("confirm_delete_product", { productName: product?.name ?? '' })}</p>,
            confirmText: t("delete"),
            confirmVariant: "danger",
            handler: () => handleConfirmAction('delete'),
        },
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <h3>{t("product_management")}</h3>
                    <Button variant="primary" onClick={() => openModal('create')} className="mb-3">
                        {t("add_product")}
                    </Button>

                    {loading && <p>{t("loading")}</p>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {message && <Alert variant="success">{message}</Alert>}

                    {!loading && productsList.length === 0 && (
                        <Alert variant="info">{t("no_products_found")}</Alert>
                    )}

                    {!loading && productsList.length > 0 && (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>{t("product_name")}</th>
                                    <th>{t("product_description")}</th>
                                    <th>{t("product_price")}</th>
                                    <th>{t("product_stock")}</th>
                                    <th>{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productsList.map((productItem) => (
                                    <tr key={productItem.$id}>
                                        <td>{productItem.name}</td>
                                        <td>{productItem.description}</td>
                                        <td>{productItem.price}</td>
                                        <td>{productItem.stock}</td>
                                        <td>
                                            <Button variant="warning" size="sm" className="me-2" onClick={() => openModal('edit', productItem)}>
                                                {t("edit")}
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => openModal('delete', productItem)}>
                                                {t("delete")}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}

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

export default ProductManagement;
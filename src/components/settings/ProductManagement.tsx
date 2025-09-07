import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Form, Button, Alert, Row, Col, Table, FormSelect } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { productService, Product, ProductCreatePayload, ProductUpdatePayload } from '../../services/productService';
import { ActionModal, ModalConfig } from './ActionModal';
import { handleError } from '../../utils/errorHandler';
import { withRetry } from '../../utils/retryLogic';
import LoadingSpinner from '../common/LoadingSpinner';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from '../common/Pagination';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'createdAt'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [modalState, setModalState] = useState<ModalState>({ type: null, product: null });
    const [formState, setFormState] = useState<ProductCreatePayload | ProductUpdatePayload>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
    });

    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedProducts = await withRetry(
                () => productService.listProducts(),
                { maxRetries: 2, delay: 1000 }
            );
            setProductsList(fetchedProducts);
        } catch (err: any) {
            setError(handleError(err, t));
        } finally {
            setLoading(false);
        }
    }, [t]);

    // Filter and sort products
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = productsList;

        // Filter by search term
        if (debouncedSearchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        // Sort products
        filtered.sort((a, b) => {
            let aValue: any = a[sortBy as keyof typeof a];
            let bValue: any = b[sortBy as keyof typeof b];

            if (sortBy === 'createdAt') {
                aValue = new Date(a.$createdAt).getTime();
                bValue = new Date(b.$createdAt).getTime();
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
    }, [productsList, debouncedSearchTerm, sortBy, sortOrder]);

    // Pagination
    const {
        currentPage,
        totalPages,
        itemsPerPage,
        paginatedItems,
        goToPage,
        setItemsPerPage,
        paginationInfo
    } = usePagination(filteredAndSortedProducts, {
        totalItems: filteredAndSortedProducts.length,
        itemsPerPage: 10
    });

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
                    await withRetry(
                        () => productService.createProduct(formState as ProductCreatePayload),
                        { maxRetries: 2, delay: 1000 }
                    );
                    setMessage(t('product_saved_success'));
                    break;
                case 'edit':
                    if (!modalState.product) return;
                    await withRetry(
                        () => productService.updateProduct({ productId: modalState.product!.$id, ...formState } as ProductUpdatePayload),
                        { maxRetries: 2, delay: 1000 }
                    );
                    setMessage(t('product_updated_success'));
                    break;
                case 'delete':
                    if (!modalState.product) return;
                    await withRetry(
                        () => productService.deleteProduct(modalState.product!.$id),
                        { maxRetries: 2, delay: 1000 }
                    );
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
                    
                    {/* Search and Filter Controls */}
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Control
                                type="text"
                                placeholder={t("search_products_placeholder")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Col>
                        <Col md={2}>
                            <FormSelect
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                            >
                                <option value="name">{t("sort_by_name")}</option>
                                <option value="price">{t("sort_by_price")}</option>
                                <option value="stock">{t("sort_by_stock")}</option>
                                <option value="createdAt">{t("sort_by_date")}</option>
                            </FormSelect>
                        </Col>
                        <Col md={2}>
                            <FormSelect
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as any)}
                            >
                                <option value="asc">{t("ascending")}</option>
                                <option value="desc">{t("descending")}</option>
                            </FormSelect>
                        </Col>
                        <Col md={2}>
                            <FormSelect
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            >
                                <option value={5}>5 {t("per_page")}</option>
                                <option value={10}>10 {t("per_page")}</option>
                                <option value={25}>25 {t("per_page")}</option>
                                <option value={50}>50 {t("per_page")}</option>
                            </FormSelect>
                        </Col>
                        <Col md={2}>
                            <Button variant="primary" onClick={() => openModal('create')} className="w-100">
                                {t("add_product")}
                            </Button>
                        </Col>
                    </Row>

                    {loading && <LoadingSpinner text={t("loading")} centered />}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {message && <Alert variant="success">{message}</Alert>}

                    {!loading && filteredAndSortedProducts.length === 0 && (
                        <Alert variant="info">
                            {searchTerm ? t("no_products_found_search") : t("no_products_found")}
                        </Alert>
                    )}

                    {!loading && filteredAndSortedProducts.length > 0 && (
                        <>
                            {/* Results info */}
                            <Row className="mb-2">
                                <Col>
                                    <small style={{ color: 'var(--text-muted)' }}>
                                        {t("showing_results", {
                                            start: paginationInfo.startIndex,
                                            end: paginationInfo.endIndex,
                                            total: filteredAndSortedProducts.length
                                        })}
                                    </small>
                                </Col>
                            </Row>

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
                                    {paginatedItems.map((productItem) => (
                                        <tr key={productItem.$id}>
                                            <td>{productItem.name}</td>
                                            <td>{productItem.description}</td>
                                            <td>${productItem.price.toFixed(2)}</td>
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

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={goToPage}
                                    className="mt-3"
                                />
                            )}
                        </>
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
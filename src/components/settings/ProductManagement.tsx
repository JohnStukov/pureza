import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Form, Button, Row, Col, Table, FormSelect, Alert } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { productService, Product, ProductCreatePayload, ProductUpdatePayload } from '../../services/productService';
import { ActionModal, ModalConfig } from './ActionModal';
import { handleError } from '../../utils/errorHandler';
import LoadingSpinner from '../common/LoadingSpinner';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';

export type ProductModalType = 'create' | 'edit' | 'delete';

export interface ModalState {
    type: ProductModalType | null;
    product: Product | null;
}

type ProductFormData = Omit<ProductUpdatePayload, 'productId'>;

const ProductManagement = () => {
    const { t } = useLanguage();
    const [productsList, setProductsList] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | '$createdAt'>('$createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [modalState, setModalState] = useState<ModalState>({ type: null, product: null });
    const [formState, setFormState] = useState<Partial<ProductFormData>>({});

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedProducts = await productService.listProducts();
            setProductsList(fetchedProducts);
        } catch (err: any) {
            toast.error(handleError(err, t));
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
            [id]: id === 'price' || id === 'stock' ? parseFloat(value) || 0 : value,
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
        setFormState({});
    };

    const handleDeleteProduct = async (productId: string) => {
        const originalProducts = productsList;
        setProductsList(current => current.filter(p => p.$id !== productId));
        closeModal();
        toast.success(t('product_deleted_success'));

        try {
            await productService.deleteProduct(productId);
        } catch (err) {
            toast.error(handleError(err, t));
            setProductsList(originalProducts);
        }
    };

    const handleUpdateProduct = async (productId: string, payload: Partial<ProductFormData>) => {
        const originalProducts = [...productsList];
        setProductsList(current => 
            current.map(p => (p.$id === productId ? { ...p, ...payload } as Product : p))
        );
        closeModal();
        toast.success(t('product_updated_success'));

        try {
            await productService.updateProduct({ productId, ...payload });
        } catch (err) {
            toast.error(handleError(err, t));
            setProductsList(originalProducts);
        }
    };

    const handleCreateProduct = async (payload: ProductCreatePayload) => {
        const promise = productService.createProduct(payload);
        toast.promise(promise, {
            loading: t('saving_product'),
            success: () => {
                fetchProducts();
                closeModal();
                return t('product_saved_success');
            },
            error: (err) => handleError(err, t),
        });
    };

    const handleConfirmAction = (action: ProductModalType) => {
        switch (action) {
            case 'create':
                handleCreateProduct(formState as ProductCreatePayload);
                break;
            case 'edit':
                if (modalState.product?.$id) {
                    handleUpdateProduct(modalState.product.$id, formState);
                }
                break;
            case 'delete':
                if (modalState.product?.$id) {
                    handleDeleteProduct(modalState.product.$id);
                }
                break;
        }
    };

    const filteredAndSortedProducts = useMemo(() => {
        let filtered = productsList;
        if (debouncedSearchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }
        filtered.sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return 0;
        });
        return filtered;
    }, [productsList, debouncedSearchTerm, sortBy, sortOrder]);

    const { paginatedItems, totalPages, currentPage, goToPage, setItemsPerPage, itemsPerPage, paginationInfo } = usePagination(filteredAndSortedProducts, {
        itemsPerPage: 10,
        totalItems: filteredAndSortedProducts.length,
    });

    const { type, product } = modalState;

    const productForm = (
        <Form>
            <Form.Group className="mb-3" controlId="name"><Form.Label>{t("product_name")}</Form.Label><Form.Control type="text" value={formState.name ?? ''} onChange={handleFormChange} required /></Form.Group>
            <Form.Group className="mb-3" controlId="description"><Form.Label>{t("product_description")}</Form.Label><Form.Control as="textarea" rows={3} value={formState.description ?? ''} onChange={handleFormChange} /></Form.Group>
            <Row>
                <Col><Form.Group className="mb-3" controlId="price"><Form.Label>{t("product_price")}</Form.Label><Form.Control type="number" step="0.01" value={formState.price ?? 0} onChange={handleFormChange} required /></Form.Group></Col>
                <Col><Form.Group className="mb-3" controlId="stock"><Form.Label>{t("product_stock")}</Form.Label><Form.Control type="number" value={formState.stock ?? 0} onChange={handleFormChange} required /></Form.Group></Col>
            </Row>
        </Form>
    );

    const modalConfig: { [key in ProductModalType]?: ModalConfig } = {
        create: { title: t("add_new_product"), body: productForm, confirmText: t("save"), confirmVariant: "primary", handler: () => handleConfirmAction('create') },
        edit: { title: t("edit_product"), body: productForm, confirmText: t("save"), confirmVariant: "primary", handler: () => handleConfirmAction('edit') },
        delete: { title: t("delete_product"), body: <p>{t("confirm_delete_product", { productName: product?.name ?? '' })}</p>, confirmText: t("delete"), confirmVariant: "danger", handler: () => handleConfirmAction('delete') },
    };

    return (
        <Container fluid>
            <Row>
                <Col>
                    <h3>{t("product_management")}</h3>
                    <Row className="mb-3">
                        <Col md={4}><Form.Control type="text" placeholder={t("search_products_placeholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></Col>
                        <Col md={2}><FormSelect value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}><option value="name">{t("sort_by_name")}</option><option value="price">{t("sort_by_price")}</option><option value="stock">{t("sort_by_stock")}</option><option value="$createdAt">{t("sort_by_date")}</option></FormSelect></Col>
                        <Col md={2}><FormSelect value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}><option value="asc">{t("ascending")}</option><option value="desc">{t("descending")}</option></FormSelect></Col>
                        <Col md={2}><FormSelect value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}><option value={5}>5 {t("per_page")}</option><option value={10}>10 {t("per_page")}</option><option value={25}>25 {t("per_page")}</option><option value={50}>50 {t("per_page")}</option></FormSelect></Col>
                        <Col md={2}><Button variant="primary" onClick={() => openModal('create', null)} className="w-100">{t("add_product")}</Button></Col>
                    </Row>

                    {loading && <LoadingSpinner text={t("loading")} centered />}
                    
                    {!loading && (
                        <>
                            {paginatedItems.length > 0 ? (
                                <>
                                    <Row className="mb-2"><Col><small style={{ color: 'var(--text-muted)' }}>{t("showing_results", {start: paginationInfo.startIndex + 1, end: paginationInfo.endIndex, total: filteredAndSortedProducts.length})}</small></Col></Row>
                                    <Table striped bordered hover responsive>
                                        <thead><tr><th>{t("product_name")}</th><th>{t("product_description")}</th><th>{t("product_price")}</th><th>{t("product_stock")}</th><th>{t("actions")}</th></tr></thead>
                                        <tbody>
                                            {paginatedItems.map((productItem) => (
                                                <tr key={productItem.$id}>
                                                    <td>{productItem.name}</td>
                                                    <td>{productItem.description}</td>
                                                    <td>${productItem.price.toFixed(2)}</td>
                                                    <td>{productItem.stock}</td>
                                                    <td>
                                                        <Button variant="warning" size="sm" className="me-2" onClick={() => openModal('edit', productItem)}>{t("edit")}</Button>
                                                        <Button variant="danger" size="sm" onClick={() => openModal('delete', productItem)}>{t("delete")}</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />}
                                </> 
                            ) : (
                                <Alert variant="info">{searchTerm ? t("no_products_found_search") : t("no_products_found")}</Alert>
                            )}
                        </>
                    )}

                    <ActionModal
                        show={!!type}
                        onClose={closeModal}
                        config={(type ? modalConfig[type] : null) || null}
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default ProductManagement;

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { productService, Product, ProductCreatePayload, ProductUpdatePayload } from '../../services/productService';
import { ActionModal, ModalConfig } from './ActionModal';
import { handleError } from '../../utils/errorHandler';
import { useOptimisticUpdate } from '../../hooks/useOptimisticUpdate';
import DataTable, { Column } from '../common/DataTable';
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

    const [modalState, setModalState] = useState<ModalState>({ type: null, product: null });
    const [formState, setFormState] = useState<Partial<ProductFormData>>({});

    // Optimistic updates
    const { optimisticUpdate: optimisticUpdateProduct } = useOptimisticUpdate<
        Product,
        ProductUpdatePayload
    >(
        productService.updateProduct,
        {
            successMessage: t('product_updated_success'),
            errorMessage: t('error_updating_product')
        }
    );

    const { optimisticUpdate: optimisticDeleteProduct } = useOptimisticUpdate<
        Product,
        string
    >(
        productService.deleteProduct,
        {
            successMessage: t('product_deleted_success'),
            errorMessage: t('error_deleting_product')
        }
    );

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
        const productToDelete = productsList.find(p => p.$id === productId);
        if (!productToDelete) return;
        
        await optimisticDeleteProduct(
            productId,
            productToDelete,
            (data) => setProductsList(current => current.filter(p => p.$id !== productId))
        );
        
        closeModal();
    };

    const handleUpdateProduct = async (productId: string, payload: Partial<ProductFormData>) => {
        const updatedProduct = { ...modalState.product!, ...payload } as Product;
        
        await optimisticUpdateProduct(
            { productId, ...payload } as ProductUpdatePayload,
            updatedProduct,
            (data) => setProductsList(current => 
                current.map(p => (p.$id === productId ? data : p))
            )
        );
        
        closeModal();
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

    const { type, product } = modalState;

    // Define columns for DataTable
    const columns: Column<Product>[] = [
        {
            key: 'name',
            label: t("product_name"),
            sortable: true
        },
        {
            key: 'description',
            label: t("product_description"),
            sortable: true
        },
        {
            key: 'price',
            label: t("product_price"),
            sortable: true,
            render: (value: number) => `$${value.toFixed(2)}`
        },
        {
            key: 'stock',
            label: t("product_stock"),
            sortable: true
        }
    ];

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
                    
                    <DataTable
                        data={productsList}
                        columns={columns}
                        loading={loading}
                        searchable={true}
                        searchPlaceholder={t("search_products_placeholder")}
                        sortable={true}
                        pagination={true}
                        itemsPerPage={10}
                        emptyMessage={t("no_products_found")}
                        headerActions={
                            <Button variant="primary" onClick={() => openModal('create', null)}>
                                {t("add_product")}
                            </Button>
                        }
                        actions={(productItem) => (
                            <>
                                <Button variant="warning" size="sm" className="me-2" onClick={() => openModal('edit', productItem)}>
                                    {t("edit")}
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => openModal('delete', productItem)}>
                                    {t("delete")}
                                </Button>
                            </>
                        )}
                    />

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

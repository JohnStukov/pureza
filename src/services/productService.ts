import { databases } from '../utils/appwrite';
import { ID, Query, Models } from 'appwrite';

const DATABASE_ID = process.env.REACT_APP_APPWRITE_DATABASE_ID!;
const PRODUCTS_COLLECTION_ID = process.env.REACT_APP_APPWRITE_PRODUCTS_COLLECTION_ID!;

export interface Product extends Models.Document {
    $id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
}

export interface ProductCreatePayload {
    name: string;
    description: string;
    price: number;
    stock: number;
}

export interface ProductUpdatePayload {
    productId: string;
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
}

export const productService = {
    listProducts: async (): Promise<Product[]> => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                PRODUCTS_COLLECTION_ID,
                [Query.orderDesc('$createdAt')]
            );
            return response.documents as unknown as Product[];
        } catch (error: any) {
            console.error('Error listing products:', error);
            throw new Error(error.message || 'Failed to list products');
        }
    },

    createProduct: async (payload: ProductCreatePayload): Promise<Product> => {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                PRODUCTS_COLLECTION_ID,
                ID.unique(),
                payload
            );
            return response as unknown as Product;
        } catch (error: any) {
            console.error('Error creating product:', error);
            throw new Error(error.message || 'Failed to create product');
        }
    },

    updateProduct: async (payload: ProductUpdatePayload): Promise<Product> => {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                PRODUCTS_COLLECTION_ID,
                payload.productId,
                payload
            );
            return response as unknown as Product;
        } catch (error: any) {
            console.error('Error updating product:', error);
            throw new Error(error.message || 'Failed to update product');
        }
    },

    deleteProduct: async (productId: string): Promise<boolean> => {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                PRODUCTS_COLLECTION_ID,
                productId
            );
            return true;
        } catch (error: any) {
            console.error('Error deleting product:', error);
            throw new Error(error.message || 'Failed to delete product');
        }
    },
};

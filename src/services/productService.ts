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

// Helper function to wrap database calls with consistent error handling
async function handleDatabaseCall<T>(promise: Promise<T>, operationName: string): Promise<T> {
    try {
        return await promise;
    } catch (error: any) {
        console.error(`Error during ${operationName}:`, error);
        throw new Error(error.message || `Failed to ${operationName}`);
    }
}

export const productService = {
    listProducts: async (): Promise<Product[]> => {
        const response = await handleDatabaseCall(
            databases.listDocuments(DATABASE_ID, PRODUCTS_COLLECTION_ID, [Query.orderDesc('$createdAt')]),
            'list products'
        );
        return response.documents as unknown as Product[];
    },

    createProduct: async (payload: ProductCreatePayload): Promise<Product> => {
        const response = await handleDatabaseCall(
            databases.createDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, ID.unique(), payload),
            'create product'
        );
        return response as unknown as Product;
    },

    updateProduct: async (payload: ProductUpdatePayload): Promise<Product> => {
        const { productId, ...updateData } = payload;
        const response = await handleDatabaseCall(
            databases.updateDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, productId, updateData),
            'update product'
        );
        return response as unknown as Product;
    },

    deleteProduct: async (productId: string): Promise<void> => {
        await handleDatabaseCall(
            databases.deleteDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, productId),
            'delete product'
        );
    },
};

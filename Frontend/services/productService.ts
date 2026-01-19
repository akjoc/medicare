import { privateClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoint";
import { Platform } from "react-native";

export interface ProductPayload {
    name: string;
    salt?: string[];
    companies?: string[];
    buyingPrice?: number;
    categoryIds: string[]; // Changed to array for multi-select
    price: number;
    salePrice?: number;
    stock?: number;
    description?: string;
    imageUrls?: string[];
    sku?: string;
    status: "active" | "inactive" | "out_of_stock";
    dosage?: string;
    packing?: string;

}

export interface ProductResponse {
    products: any[];
    currentPage: number;
    totalPages: number;
    totalProducts: number;
}

export const productService = {
    createProduct: async (data: ProductPayload) => {
        try {
            const response = await privateClient.post(ENDPOINTS.CREATE_PRODUCT, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProducts: async (page = 1, limit = 10): Promise<ProductResponse> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_PRODUCTS, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    searchProducts: async (searchQuery: string, page = 1, limit = 10): Promise<ProductResponse> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_PRODUCTS, {
                params: { search: searchQuery, page, limit }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProductById: async (id: string) => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_PRODUCT_BY_ID(id));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateProduct: async (id: string, data: ProductPayload) => {
        try {
            const response = await privateClient.put(ENDPOINTS.UPDATE_PRODUCT(id), data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteProduct: async (id: string) => {
        try {
            const response = await privateClient.delete(ENDPOINTS.DELETE_PRODUCT(id));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    bulkUploadProducts: async (file: any, onProgress?: (progress: number) => void) => {
        try {
            const formData = new FormData();

            if (Platform.OS === 'web') {
                if (file.file) {
                    formData.append('file', file.file);
                } else {
                    // Fallback if file object is missing but we have uri
                    const response = await fetch(file.uri);
                    const blob = await response.blob();
                    formData.append('file', blob, file.name);
                }
            } else {
                formData.append('file', {
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                } as any);
            }

            const response = await privateClient.post(ENDPOINTS.BULK_UPLOAD_PRODUCTS, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = progressEvent.loaded / progressEvent.total;
                        onProgress(progress);
                    }
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

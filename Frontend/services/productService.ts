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
            const formData = new FormData();

            // Append simple fields
            (Object.keys(data) as Array<keyof ProductPayload>).forEach(key => {
                const value = data[key];
                // Handle arrays and files separately
                if (key === 'imageUrls' || key === 'categoryIds' || key === 'salt' || key === 'companies') return;

                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            // Handle Arrays (Backend expects JSON stringified arrays)
            if (data.categoryIds && data.categoryIds.length > 0) {
                formData.append('categoryIds', JSON.stringify(data.categoryIds));
            }
            if (data.salt && data.salt.length > 0) {
                formData.append('salt', JSON.stringify(data.salt));
            }
            if (data.companies && data.companies.length > 0) {
                formData.append('companies', JSON.stringify(data.companies));
            }

            // Handle Images
            if (data.imageUrls) {
                data.imageUrls.forEach((uri, index) => {
                    const filename = uri.split('/').pop() || `image_${index}.jpg`;
                    const ext = filename.split('.').pop()?.toLowerCase();
                    let type = `image/jpeg`; // Default
                    if (ext === 'png') type = `image/png`;
                    else if (ext === 'jpg' || ext === 'jpeg') type = `image/jpeg`;

                    formData.append('images', {
                        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                        name: filename,
                        type: type,
                    } as any);
                });
            }

            const response = await privateClient.post(ENDPOINTS.CREATE_PRODUCT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
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
            const formData = new FormData();

            // Append simple fields
            (Object.keys(data) as Array<keyof ProductPayload>).forEach(key => {
                const value = data[key];
                // Handle arrays and files separately
                if (key === 'imageUrls' || key === 'categoryIds' || key === 'salt' || key === 'companies') return;

                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            // Handle Arrays
            if (data.categoryIds && data.categoryIds.length > 0) {
                formData.append('categoryIds', JSON.stringify(data.categoryIds));
            }
            if (data.salt && data.salt.length > 0) {
                formData.append('salt', JSON.stringify(data.salt));
            }
            if (data.companies && data.companies.length > 0) {
                formData.append('companies', JSON.stringify(data.companies));
            }

            // Handle Images
            // Note: For update, backend should handle existing URLs vs new Files.
            // We append both; typically backend filters strings vs files.
            if (data.imageUrls) {
                data.imageUrls.forEach((uri, index) => {
                    // Check if it's a remote URL or local file
                    if (uri.startsWith('http')) {
                        formData.append('existingImageUrls', uri); // Or 'images' depending on backend
                    } else {
                        const filename = uri.split('/').pop() || `image_${index}.jpg`;
                        const match = /\.(\w+)$/.exec(filename);
                        const type = match ? `image/${match[1]}` : `image/jpeg`;

                        formData.append('images', {
                            uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                            name: filename,
                            type: type,
                        } as any);
                    }
                });
            }

            const response = await privateClient.put(ENDPOINTS.UPDATE_PRODUCT(id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
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

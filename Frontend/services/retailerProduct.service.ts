import { privateClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoint";
import { APIProduct } from "@/types/api";

export interface ProductResponse {
    products: APIProduct[];
    currentPage: number;
    totalPages: number;
    totalProducts: number;
}

export const retailerProductService = {
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

    getProductById: async (id: string): Promise<APIProduct> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_PRODUCT_BY_ID(id));
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

    getProductsByCategory: async (categoryName: string, page = 1, limit = 10): Promise<ProductResponse> => {
        try {
            // Use 'category' query param with the name
            const response = await privateClient.get(ENDPOINTS.GET_PRODUCTS, {
                params: { category: categoryName, page, limit }
            });
            console.log(`Fetching products for Category: ${categoryName}, page: ${page}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

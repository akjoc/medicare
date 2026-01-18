import { privateClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoint";
import { APICategory } from "@/types/api";

export const retailerCategoryService = {
    getAllCategories: async (): Promise<APICategory[]> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_CATEGORIES);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getCategoryById: async (id: string): Promise<APICategory> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_CATEGORY_BY_ID(id));
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

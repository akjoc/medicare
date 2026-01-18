import { privateClient } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoint";

export interface RetailerPayload {
    shopName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    drugLicenseNumber?: string;
    gst?: string;
    password: string;
    status: "active" | "inactive";
    rating?: number;
    categoryIds?: string[];
}

export interface RetailerResponse {
    retailers: any[];
    totalRetailers: number;
    totalPages: number;
    currentPage: number;
}

export const retailerService = {
    createRetailer: async (data: RetailerPayload) => {
        try {
            const response = await privateClient.post(ENDPOINTS.CREATE_RETAILER, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getRetailers: async (page = 1, limit = 10): Promise<RetailerResponse> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_RETAILERS, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    searchRetailers: async (searchQuery: string, page = 1, limit = 10): Promise<RetailerResponse> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_RETAILERS, {
                params: { search: searchQuery, page, limit }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getRetailerById: async (id: string) => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_RETAILER_BY_ID(id));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateRetailer: async (id: string, data: RetailerPayload) => {
        try {
            const response = await privateClient.put(ENDPOINTS.UPDATE_RETAILER(id), data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteRetailer: async (id: string) => {
        try {
            const response = await privateClient.delete(ENDPOINTS.DELETE_RETAILER(id));
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

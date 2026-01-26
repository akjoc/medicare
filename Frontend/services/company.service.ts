import { privateClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoint';

export interface Company {
    id: string;
    name: string;
    status: 'active' | 'inactive';
}

export const CompanyService = {
    getAll: async (): Promise<Company[]> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_COMPANIES);
            return response.data;
        } catch (error) {
            console.error("Error fetching companies:", error);
            throw error;
        }
    },

    getById: async (id: string): Promise<Company> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_COMPANY_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error(`Error fetching company ${id}:`, error);
            throw error;
        }
    },

    create: async (data: Omit<Company, 'id'>): Promise<Company> => {
        try {
            const response = await privateClient.post(ENDPOINTS.CREATE_COMPANY, data);
            return response.data;
        } catch (error) {
            console.error("Error creating company:", error);
            throw error;
        }
    },

    update: async (id: string, data: Partial<Omit<Company, 'id'>>): Promise<Company> => {
        try {
            const response = await privateClient.put(ENDPOINTS.UPDATE_COMPANY(id), data);
            return response.data;
        } catch (error) {
            console.error(`Error updating company ${id}:`, error);
            throw error;
        }
    },

    delete: async (id: string): Promise<void> => {
        try {
            await privateClient.delete(ENDPOINTS.DELETE_COMPANY(id));
        } catch (error) {
            console.error(`Error deleting company ${id}:`, error);
            throw error;
        }
    }
};

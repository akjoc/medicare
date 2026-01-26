import { privateClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoint';

export interface AppSettings {
    appName: string;
    tagline: string;
    whatsappNumber: string;
    callSupportNumber: string;
    gstNumber: string;
}

export const AppSettingsService = {
    getSettings: async (): Promise<AppSettings> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_APP_SETTINGS);
            return response.data;
        } catch (error) {
            console.error("Error fetching app settings:", error);
            throw error;
        }
    },

    updateSettings: async (data: AppSettings): Promise<AppSettings> => {
        try {
            const response = await privateClient.put(ENDPOINTS.UPDATE_APP_SETTINGS, data);
            return response.data;
        } catch (error) {
            console.error("Error updating app settings:", error);
            throw error;
        }
    }
};

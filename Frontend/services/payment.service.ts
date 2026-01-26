import { privateClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoint';
import { AdminPaymentConfiguration, RetailerPaymentConfiguration } from '@/data/paymentMethods';
import { Platform } from 'react-native';

export const PaymentService = {
    getConfiguration: async (): Promise<AdminPaymentConfiguration> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_PAYMENT_CONFIG);
            return response.data;
        } catch (error) {
            console.error("Error fetching payment config:", error);
            throw error;
        }
    },

    getRetailerConfiguration: async (): Promise<RetailerPaymentConfiguration> => {
        try {
            const response = await privateClient.get(ENDPOINTS.GET_PAYMENT_CONFIG_RETAILER);
            return response.data;
        } catch (error) {
            console.error("Error fetching retailer payment config:", error);
            throw error;
        }
    },

    updateConfiguration: async (config: Partial<AdminPaymentConfiguration>, qrCodeFile?: any): Promise<AdminPaymentConfiguration> => {
        try {
            const formData = new FormData();

            // Append all fields to FormData
            Object.keys(config).forEach(key => {
                const value = (config as any)[key];
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            // Append image if provided
            if (qrCodeFile) {
                formData.append('qrCodeImage', {
                    uri: Platform.OS === 'android' ? qrCodeFile.uri : qrCodeFile.uri.replace('file://', ''),
                    type: qrCodeFile.mimeType || 'image/jpeg',
                    name: qrCodeFile.fileName || 'qrcode.jpg',
                } as any);
            }

            const response = await privateClient.put(ENDPOINTS.UPDATE_PAYMENT_CONFIG, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error updating payment config:", error);
            throw error;
        }
    },
};
